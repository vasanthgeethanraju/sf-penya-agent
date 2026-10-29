import fs from "node:fs/promises";
import path from "node:path";
import type { MatchInfo } from "../types";
import { getLastCompletedOfficialBarcaMatch } from "../providers/barcaOfficialResults";

export type RecentMatchContext = {
  date: string;
  opponent: string;
  result: string;
  sourceUrl: string;
  selectionMethod: "goalscorers";
  fetchedAt: string;
  // Barcelona goalscorers only, ordered by goal count.
  standoutPlayers: string[];
};

export async function getRecentMatchContext(match: MatchInfo): Promise<RecentMatchContext | null> {
  try {
    const previous = await getLastCompletedOfficialBarcaMatch(match.date);
    const context: RecentMatchContext = {
      date: previous.date,
      opponent: previous.homeTeam === "FC Barcelona" ? previous.awayTeam : previous.homeTeam,
      result: `${previous.homeTeam} ${previous.homeGoals}-${previous.awayGoals} ${previous.awayTeam}`,
      sourceUrl: previous.sourceUrl,
      selectionMethod: "goalscorers",
      fetchedAt: new Date().toISOString(),
      standoutPlayers: previous.goalscorers,
    };

    // Save an inspectable snapshot. Always fetch fresh data; never reuse it on failure.
    const directory = path.join(process.cwd(), "data");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, "recent-match-context.json"), JSON.stringify(context, null, 2), "utf-8");

    console.log(`Recent match: ${context.result} (${context.date})`);
    console.log(`Goalscorer priorities: ${context.standoutPlayers.join(", ") || "none"}`);
    return context;
  } catch (error) {
    console.warn("Recent-match context unavailable; using normal player selection.", error instanceof Error ? error.message : error);
    return null;
  }
}
