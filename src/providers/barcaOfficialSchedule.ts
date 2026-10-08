import * as cheerio from "cheerio";

const BARCA_SCHEDULE_URL =
  "https://www.fcbarcelona.com/en/football/first-team/schedule";

export async function fetchOfficialBarcaSchedulePage() {
  const response = await fetch(BARCA_SCHEDULE_URL);

  if (!response.ok) {
    throw new Error(
      `Official Barça schedule request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

export async function getNextOfficialBarcaFixture() {
  const html = await fetchOfficialBarcaSchedulePage();

  const $ = cheerio.load(html);

  const fixture = $(".fixture-result-list__fixture").first();

  if (!fixture.length) {
    throw new Error("No upcoming Barça fixture found.");
  }

  const kickoffTimestamp = fixture
    .find("[data-kickoff]")
    .attr("data-kickoff");

  const homeTeam = fixture
    .find(".fixture-info__name--home")
    .text()
    .trim();

  const awayTeam = fixture
    .find(".fixture-info__name--away")
    .text()
    .trim();

  const competition = fixture
    .find(".fixture-result-list__name")
    .text()
    .trim();

  const matchVenue = fixture
    .find(".fixture-result-list__stage-location")
    .text()
    .trim();

  if (!kickoffTimestamp) {
    throw new Error("Kickoff timestamp was missing.");
  }

  return {
    kickoffTimestamp: Number(kickoffTimestamp),
    homeTeam,
    awayTeam,
    competition,
    matchVenue,
  };
}