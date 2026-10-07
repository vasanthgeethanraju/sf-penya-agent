import OpenAI from "openai";

const client = new OpenAI();

type Match = {
  opponent: string;
  competition: string;
  date: string;
  day: string;
  kickoffTime: string;
  venue: string;
};

export async function generateWhatsAppMessage(match: Match) {
  const prompt = `
You are the communications assistant for Penya Barcelonista San Francisco.

Write a short WhatsApp message inviting supporters to watch the upcoming Barcelona match.

Match details:
Opponent: ${match.opponent}
Competition: ${match.competition}
Date: ${match.date}
Day: ${match.day}
Kickoff time: ${match.kickoffTime}
Venue: ${match.venue}

Writing style:
- Casual and natural
- Sound like a real Barça supporter wrote it
- Keep it concise
- Do not use em dashes
- Use a few relevant emojis
- Mention SF Penya
- Always write "Visca Barça!" exactly like that
- Never invent match information
`;

  const response = await client.responses.create({
    model: "gpt-6-luna",
    input: prompt,
  });

  return response.output_text;
}