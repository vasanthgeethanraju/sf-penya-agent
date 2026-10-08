import { z } from "zod";

const BarcaApiResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    matchDate: z.string(),
    venue: z.string(),
    status: z.string(),
    competition: z.string(),
  }),
});

export async function getNextBarcaMatch() {
  const response = await fetch(
    "https://api.fc-barcelona.app/api/next-match"
  );

  if (!response.ok) {
    throw new Error(
      `Barça API request failed: ${response.status} ${response.statusText}`
    );
  }

  const rawData = await response.json();

  const parsed = BarcaApiResponseSchema.parse(rawData);

  const match = parsed.data;

  const opponent =
    match.homeTeam === "Barcelona"
      ? match.awayTeam
      : match.homeTeam;

  const kickoff = new Date(match.matchDate);

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(kickoff);

  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
  }).format(kickoff);

  const kickoffTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(kickoff);

    const isHomeGame = match.homeTeam === "Barcelona";

  return {
    opponent,
    competition: match.competition,
    date,
    day,
    kickoffTime,
    matchVenue: match.venue,
    watchVenue: "Mad Dog in the Fog",
    isHomeGame,
  };
}