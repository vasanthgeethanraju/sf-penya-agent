import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { MatchDayContentSchema } from "./schemas/matchDayContentSchema";
import { getMatchContext } from "./tools/getMatchContext";
import { MATCH_DAY_SYSTEM_PROMPT } from "./prompts/matchDaySystemPrompt";

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
        content: MATCH_DAY_SYSTEM_PROMPT,
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