import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const client = new OpenAI();

type Match = {
  opponent: string;
  competition: string;
  date: string;
  day: string;
  kickoffTime: string;
  venue: string;
};

export const MatchDayContentSchema = z.object({
  whatsapp: z.string(),
  instagram: z.string(),
  emailSubject: z.string(),
  emailBody: z.string(),
});

type MatchDayContent = z.infer<typeof MatchDayContentSchema>;

export async function generateMatchDayContent(
  match: Match
): Promise<MatchDayContent> {
  const response = await client.responses.parse({
    model: "gpt-6-luna",

    input: [
      {
        role: "system",
        content: `
You are the communications assistant for Penya Barcelonista San Francisco.

Writing rules:

WhatsApp:
- Short and casual
- Human sounding
- Easy to scan
- Use a few relevant emojis
- Mention SF Penya
- End with "Visca Barça!"

Instagram:
- Energetic and fun
- Sound like a real Bay Area Barça supporters club
- Use short paragraphs and line breaks
- Use emojis naturally
- Feel excited, not corporate
- Mention the Bay Area or PBSF when natural
- You may use phrases like "THE BAY IS BLAUGRANA"
- End with "VISCA EL BARÇA | VISCA PBSF!"
- Do not copy previous posts word for word

Email:
- Friendly and clear
- Include a short subject
- Clearly communicate the match information
- Invite members to join at the venue
- Keep it concise

General rules:
- Do not use em dashes
- Never invent match information
- If information is missing, do not make it up
`,
      },
      {
        role: "user",
        content: `
Create the match-day content package for this match:

Opponent: ${match.opponent}
Competition: ${match.competition}
Date: ${match.date}
Day: ${match.day}
Kickoff time: ${match.kickoffTime}
Venue: ${match.venue}
`,
      },
    ],

    text: {
      format: zodTextFormat(
        MatchDayContentSchema,
        "match_day_content"
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The model did not return match-day content.");
  }

  return response.output_parsed;
}