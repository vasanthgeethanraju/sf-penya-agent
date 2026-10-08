import { getNextOfficialBarcaFixture } from "../providers/barcaOfficialSchedule";

export async function getNextBarcaMatch() {
  const fixture = await getNextOfficialBarcaFixture();

  const isHomeGame = fixture.homeTeam === "FC Barcelona";

  const opponent = isHomeGame
    ? fixture.awayTeam
    : fixture.homeTeam;

  const kickoff = new Date(fixture.kickoffTimestamp);

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

  return {
    opponent,
    competition: fixture.competition,
    date,
    day,
    kickoffTime,
    matchVenue: fixture.matchVenue,
    watchVenue: "Mad Dog in the Fog",
    isHomeGame,
  };
}