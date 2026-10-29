import { getNextBarcaMatch } from "../src/tools/getNextBarcaMatch";
import { getRecentMatchContext } from "../src/poster/recentMatchContext";
import { buildPosterConfig } from "../src/poster/buildPosterConfig";

async function main() {
  const match = await getNextBarcaMatch();
  const recentMatchContext = await getRecentMatchContext(match);
  if (!recentMatchContext) throw new Error("Live recent-match context check failed.");

  const config = buildPosterConfig(match, recentMatchContext.standoutPlayers);
  console.log(JSON.stringify({ nextMatch: match, recentMatchContext, selectedPlayers: config.featuredBarcelonaPlayers }, null, 2));
  console.log("Snapshot saved: data/recent-match-context.json (no OpenAI calls).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
