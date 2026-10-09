import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { MatchDayContentSchema } from "./ai";
import { getMatchContext } from "./tools/getMatchContext";

const client = new OpenAI();

const tools = [
  {
    type: "function" as const,
    name: "get_match_context",
    description:
      "Get the next FC Barcelona match details and relevant San Francisco weather.",
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
use the available tools to get the match information and local context.

Never invent match information.

Important venue rules:
- matchVenue is where FC Barcelona is physically playing.
- watchVenue is where Penya Barcelonista San Francisco members are meeting.
- For invitations, WhatsApp, Instagram, and email, always tell supporters to meet at watchVenue.
- You may mention matchVenue only as match context.
- If isHomeGame is true, you may naturally mention that Barça are playing at home.
- If isHomeGame is false, you may mention that Barça are away.

Weather rules:
- Weather refers to San Francisco near the watchVenue.
- Only mention weather if it is genuinely useful to supporters.
- Do not force weather into every message.
- Since the watch party is indoors, normal weather usually does not need to be mentioned.
- Weather may be worth mentioning if there is heavy rain, unusually hot or cold weather, or another condition that could affect travel to the watchVenue.

Event rules:
- Events refer to San Francisco events that may affect supporters traveling to the watchVenue.
- Only mention an event if it is genuinely useful.
- Do not mention events just because they exist.
- Relevant events may be worth mentioning if they could affect traffic, parking, crowds, or transit near the watchVenue.
- If there are no relevant events, do not mention events.

Transit rules:
- Transit alerts refer to Bay Area public transit issues that may affect supporters traveling to the watchVenue.
- Only mention a transit alert if it could realistically affect travel to Mad Dog in the Fog.
- Do not mention minor or unrelated transit alerts.
- If there are no relevant transit alerts, do not mention transit.
- Keep any transit warning short and practical.

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
      item.name === "get_match_context"
    ) {
      console.log("Agent chose tool:", item.name);

      const context = await getMatchContext();

      console.log("Tool returned:", context);

      const finalResponse = await client.responses.parse({
        model: "gpt-6-luna",

        previous_response_id: firstResponse.id,

        tools,

        input: [
          {
            type: "function_call_output",
            call_id: item.call_id,
            output: JSON.stringify(context),
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
        throw new Error(
          "Agent did not generate match-day content."
        );
      }

      return {
        match: context.match,
        weather: context.weather,
        events: context.events,
        transitAlerts: context.transitAlerts,
        content: finalResponse.output_parsed,
      };
    }
  }

  throw new Error(
    "Agent did not request the match context tool."
  );
}