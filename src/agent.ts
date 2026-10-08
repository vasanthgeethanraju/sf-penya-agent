import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { MatchDayContentSchema } from "./ai";
import { getNextBarcaMatch } from "./tools/getNextBarcaMatch";

const client = new OpenAI();

const tools = [
  {
    type: "function" as const,
    name: "get_next_barca_match",
    description: "Get the next FC Barcelona match details.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function prepareNextMatchDayContent() {
  const firstResponse = await client.responses.create({
    model: "gpt-6-luna",

    input: [
      {
        role: "system",
        content: `
You are the match-day communications assistant for Penya Barcelonista San Francisco.

When asked to prepare content for the next Barcelona match,
use the available tools to get the match information.

Never invent match information.

Important venue rules:
- matchVenue is where FC Barcelona is physically playing.
- watchVenue is where Penya Barcelonista San Francisco members are meeting.
- For invitations, WhatsApp, Instagram, and email, always tell supporters to meet at watchVenue.
- You may mention matchVenue only as match context.
- If isHomeGame is true, you may naturally mention that Barça are playing at home.
- If isHomeGame is false, you may mention that Barça are away.

Writing rules:
- Keep the tone natural, casual, and human.
- Do not sound corporate.
- Never use the character "—". Use commas or periods instead.
- Do not invent details that are not returned by the tools.
`,
      },
      {
        role: "user",
        content:
          "Prepare the match-day content package for Barcelona's next match.",
      },
    ],

    tools,
  });

  for (const item of firstResponse.output) {
    if (
      item.type === "function_call" &&
      item.name === "get_next_barca_match"
    ) {
      console.log("Agent chose tool:", item.name);

      const match = await getNextBarcaMatch();

      console.log("Tool returned:", match);

      const finalResponse = await client.responses.parse({
        model: "gpt-6-luna",

        previous_response_id: firstResponse.id,

        tools,

        input: [
          {
            type: "function_call_output",
            call_id: item.call_id,
            output: JSON.stringify(match),
          },
        ],

        text: {
          format: zodTextFormat(
            MatchDayContentSchema,
            "match_day_content"
          ),
        },
      });

      if (!finalResponse.output_parsed) {
        throw new Error("Agent did not generate match-day content.");
      }

      return finalResponse.output_parsed;
    }
  }

  throw new Error("Agent did not request the Barcelona match tool.");
}