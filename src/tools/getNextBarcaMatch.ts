import { getNextOfficialBarcaFixture } from "../providers/barcaOfficialSchedule";

export async function getNextBarcaMatch() {
  const fixture = await getNextOfficialBarcaFixture();

  const isHomeGame = fixture.homeTeam === "FC Barcelona";

  const opponent = isHomeGame
    ? fixture.awayTeam
    : fixture.homeTeam;

  const kickoff = new Date(fixture.kickoffTimestamp);

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(kickoff);

  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const dayOfMonth = dateParts.find((part) => part.type === "day")?.value;

  const date = `${year}-${month}-${dayOfMonth}`;

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