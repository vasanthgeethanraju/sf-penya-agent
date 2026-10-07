import "dotenv/config";
import OpenAI from "openai";
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

async function main() {
  const firstResponse = await client.responses.create({
    model: "gpt-6-luna",
    input: "What is Barcelona's next match?",
    tools,
  });

  for (const item of firstResponse.output) {
    if (
      item.type === "function_call" &&
      item.name === "get_next_barca_match"
    ) {
      console.log("Model requested tool:", item.name);

      const match = await getNextBarcaMatch();

      console.log("Our tool returned:", match);

      const finalResponse = await client.responses.create({
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
      });

      console.log("\nFINAL ANSWER\n");
      console.log(finalResponse.output_text);
    }
  }
}

main();