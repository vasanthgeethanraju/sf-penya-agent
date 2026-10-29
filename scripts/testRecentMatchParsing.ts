import assert from "node:assert/strict";
import test from "node:test";
import { parseLastCompletedBarcaResult, parseBarcaGoalscorers, type CompletedBarcaResult } from "../src/providers/barcaOfficialResults";
import { getRecentMatchContext } from "../src/poster/recentMatchContext";
import type { MatchInfo } from "../src/types";

// Synthetic HTML with the same structure as the official pages; no network calls.
const kickoff = Date.parse("2026-10-25T20:00:00Z");
const now = Date.parse("2026-10-29T18:00:00Z");
const match: CompletedBarcaResult = {
  date: "2026-10-25", kickoffTimestamp: kickoff,
  homeTeam: "FC Barcelona", awayTeam: "Test Opponent", homeGoals: 1, awayGoals: 2,
  sourceUrl: "https://www.fcbarcelona.com/en/matches/sample",
};

function fixture(id: string, timestamp: number, status = "Complete", score = "1 - 2") {
  const url = `https://www.fcbarcelona.com/en/matches/${id}`;
  return `<script type="application/ld+json">${JSON.stringify({ "@type": "SportsEvent", eventStatus: status, url })}</script>
    <li class="fixture-result-list__fixture">
      <a class="fixture-result-list__link" href="${url}">
        <div data-fixture-date="${timestamp}"></div>
        <div class="fixture-info__name--home">FC Barcelona</div>
        <div class="fixture-info__name--away">Test Opponent</div>
        <div class="fixture-info__score"><span>${score}</span></div>
      </a>
    </li>`;
}

function goal(player: string, minutes: string, symbol = "goal") {
  return `<div class="match-hero__event">
    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/icons.svg#${symbol}"></use></svg>
    <div class="match-hero__event-time">${minutes}<span class="match-hero__event-player">${player}</span></div>
  </div>`;
}

function matchPage(homeEvents: string, awayEvents = "", status = "C", timestamp = kickoff, home = "FC Barcelona", away = "Test Opponent") {
  return `<div data-widget="match-hero" data-match-status="${status}" data-kickoff="${timestamp}">
    <div class="fixture-info__name--home">${home}</div>
    <div class="fixture-info__name--away">${away}</div>
    <div class="js-match-events-home">${homeEvents}</div>
    <div class="js-match-events-away">${awayEvents}</div>
  </div>`;
}

test("chooses the latest completed result regardless of list order; excludes live/future/upcoming fixtures", () => {
  const html = fixture("old", kickoff - 86400000)
    + fixture("live", kickoff + 86400000, "InProgress")
    + fixture("latest", kickoff)
    + fixture("future", now + 86400000)
    + fixture("after-cutoff", now - 3600000);
  const result = parseLastCompletedBarcaResult(html, "2026-10-26", now);
  assert.equal(result.sourceUrl, "https://www.fcbarcelona.com/en/matches/latest");
  assert.equal(result.date, "2026-10-25");
  assert.equal(result.homeGoals, 1);
});

test("rejects missing or malformed dates/scores and unrelated page content", () => {
  for (const html of ["<html></html>", fixture("bad-score", kickoff, "Complete", "TBA"), fixture("bad-date", NaN)]) {
    assert.throws(() => parseLastCompletedBarcaResult(html, "2026-10-31", now), /No completed/);
  }
});

test("normalizes match dates into San Francisco time", () => {
  const html = fixture("late", Date.parse("2026-10-26T00:30:00Z"));
  assert.equal(parseLastCompletedBarcaResult(html, "2026-10-26", now).date, "2026-10-25");
});

test("reads namespaced goal icons and excludes opposing scorers", () => {
  const html = matchPage(goal("Raphinha", "61'"), goal("Opponent", "41', 87'"));
  assert.deepEqual(parseBarcaGoalscorers(html, match), ["Raphinha"]);
});

test("counts repeated goals including stoppage time and prioritizes the top scorer", () => {
  const html = matchPage(goal("Pedri", "15'") + goal("Raphinha", "61', 90+2'"));
  assert.deepEqual(parseBarcaGoalscorers(html, { ...match, homeGoals: 3 }), ["Raphinha", "Pedri"]);
});

test("reads Barça's away events and ignores own-goal names", () => {
  const html = matchPage(goal("Opponent", "20'"), goal("Raphinha", "61'") + goal("Opposing Defender", "80'", "own-goal"), "C", kickoff, "Test Opponent", "FC Barcelona");
  const awayMatch = { ...match, homeTeam: "Test Opponent", awayTeam: "FC Barcelona", homeGoals: 1, awayGoals: 2 };
  assert.deepEqual(parseBarcaGoalscorers(html, awayMatch), ["Raphinha"]);
});

test("a scoreless match has no goalscorer priorities", () => {
  assert.deepEqual(parseBarcaGoalscorers(matchPage(""), { ...match, homeGoals: 0 }), []);
});

test("rejects incomplete, mismatched, and broken goal-event pages", () => {
  for (const html of [matchPage("", "", "L"), matchPage("", "", "C", kickoff - 1000), matchPage("")]) {
    assert.throws(() => parseBarcaGoalscorers(html, match));
  }
});

test("source failure returns no context instead of reusing the saved snapshot", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("Simulated network failure"); });
  t.mock.method(console, "warn", () => {});
  const nextMatch: MatchInfo = {
    opponent: "Test Opponent", competition: "La Liga", date: "2026-10-31", day: "Saturday",
    kickoffTime: "1:00 PM", matchVenue: "Test stadium", watchVenue: "Mad Dog in the Fog", isHomeGame: true,
  };
  assert.equal(await getRecentMatchContext(nextMatch), null);
});
