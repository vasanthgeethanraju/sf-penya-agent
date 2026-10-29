import * as cheerio from "cheerio";

const RESULTS_URL = "https://www.fcbarcelona.com/en/football/first-team/results";
const BARCA = "FC Barcelona";

export type CompletedBarcaResult = {
  date: string;
  kickoffTimestamp: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  sourceUrl: string;
};

async function fetchPage(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });

  if (!response.ok) {
    throw new Error(`Official Barça results request failed: ${response.status}`);
  }

  return response.text();
}

// Pure parsing functions make it possible to check saved/synthetic HTML offline.
export function parseLastCompletedBarcaResult(
  html: string,
  beforeDate: string,
  now = Date.now()
): CompletedBarcaResult {
  const $ = cheerio.load(html);
  const completedUrls = new Set<string>();

  // The site's structured metadata explicitly marks finished matches as Complete.
  $('script[type="application/ld+json"]').each((_, element) => {
    let data;
    try {
      data = JSON.parse($(element).text());
    } catch {
      return;
    }

    for (const event of Array.isArray(data) ? data : [data]) {
      if (event?.["@type"] === "SportsEvent" && event.eventStatus === "Complete" && typeof event.url === "string") {
        completedUrls.add(new URL(event.url, RESULTS_URL).href);
      }
    }
  });

  const results: CompletedBarcaResult[] = [];

  $(".fixture-result-list__fixture").each((_, element) => {
    const fixture = $(element);
    const href = fixture.find(".fixture-result-list__link").attr("href");
    if (!href) return;

    const sourceUrl = new URL(href, RESULTS_URL);
    if (sourceUrl.origin !== new URL(RESULTS_URL).origin || !completedUrls.has(sourceUrl.href)) return;

    const rawTimestamp = fixture.find("[data-fixture-date]").attr("data-fixture-date");
    const kickoffTimestamp = Number(rawTimestamp);
    if (!rawTimestamp?.trim() || !Number.isFinite(kickoffTimestamp) || kickoffTimestamp <= 0 || kickoffTimestamp >= now) return;

    const kickoff = new Date(kickoffTimestamp);
    if (Number.isNaN(kickoff.getTime())) return;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(kickoff);
    if (date >= beforeDate) return;

    const homeTeam = fixture.find(".fixture-info__name--home").text().trim();
    const awayTeam = fixture.find(".fixture-info__name--away").text().trim();
    const score = fixture.find(".fixture-info__score span").first().text().trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (!homeTeam || !awayTeam || (homeTeam !== BARCA && awayTeam !== BARCA) || !score) return;

    results.push({ date, kickoffTimestamp, homeTeam, awayTeam, homeGoals: Number(score[1]), awayGoals: Number(score[2]), sourceUrl: sourceUrl.href });
  });

  const latest = results.sort((a, b) => b.kickoffTimestamp - a.kickoffTimestamp)[0];
  if (!latest) throw new Error("No completed Barça result found before the upcoming match.");
  return latest;
}

export function parseBarcaGoalscorers(html: string, match: CompletedBarcaResult): string[] {
  const $ = cheerio.load(html);
  const hero = $('[data-widget="match-hero"]').first();

  if (hero.attr("data-match-status") !== "C" || Number(hero.attr("data-kickoff")) !== match.kickoffTimestamp) {
    throw new Error("Match page did not confirm the expected completed fixture.");
  }

  const side = match.homeTeam === BARCA ? "home" : "away";
  if (hero.find(`.fixture-info__name--${side}`).text().trim() !== BARCA) {
    throw new Error("Could not identify Barcelona's side on the match page.");
  }

  const goalsByPlayer = new Map<string, number>();
  let extractedGoals = 0;
  hero.find(`.js-match-events-${side} .match-hero__event`).each((_, element) => {
    const event = $(element);
    // Cheerio normalizes namespaced SVG attributes to href when parsing HTML.
    const icon = event.find("use");
    const symbol = (icon.attr("href") ?? icon.attr("xlink:href"))?.split("#").pop();
    if (symbol !== "goal" && symbol !== "own-goal") return;

    const time = event.find(".match-hero__event-time").clone();
    time.find(".match-hero__event-player").remove();
    const goals = time.text().match(/\d+(?:\+\d+)?\s*['’]/g)?.length ?? 0;
    if (!goals) throw new Error("Goal timing could not be read.");
    extractedGoals += goals;

    // An opponent's own goal contributes to Barça's score, but not our player picks.
    if (symbol === "own-goal") return;
    const player = event.find(".match-hero__event-player").text().trim();
    if (!player || !goals) throw new Error("A goalscorer entry could not be read.");
    goalsByPlayer.set(player, (goalsByPlayer.get(player) ?? 0) + goals);
  });

  const barcaGoals = side === "home" ? match.homeGoals : match.awayGoals;
  if (extractedGoals !== barcaGoals) {
    throw new Error("Extracted goal events do not match Barcelona's score.");
  }

  // This is a transparent goals-based rule, not an overall performance rating.
  return [...goalsByPlayer].sort((a, b) => b[1] - a[1]).map(([player]) => player);
}

export async function getLastCompletedOfficialBarcaMatch(beforeDate: string) {
  const result = parseLastCompletedBarcaResult(await fetchPage(RESULTS_URL), beforeDate);
  const goalscorers = parseBarcaGoalscorers(await fetchPage(result.sourceUrl), result);
  return { ...result, goalscorers };
}
