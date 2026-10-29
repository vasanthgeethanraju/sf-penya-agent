import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";

import { getNextBarcaMatch } from "../src/tools/getNextBarcaMatch";
import { buildPosterConfig } from "../src/poster/buildPosterConfig";
import { buildPosterPrompt } from "../src/poster/buildPosterPrompt";
import { generatePosterImage } from "../src/poster/generatePosterImage";
import { getRecentMatchContext } from "../src/poster/recentMatchContext";

async function main() {
  const match = await getNextBarcaMatch();

  if (!match.date || !match.kickoffTime) {
    throw new Error("Match date and kickoff time are required before generating a poster.");
  }

  const recentMatchContext = await getRecentMatchContext(match);
  const config = buildPosterConfig(match, recentMatchContext?.standoutPlayers ?? []);
  const prompt = buildPosterPrompt(match, config);

  await fs.mkdir("generated", { recursive: true });
  const outputBase = path.join("generated", `poster-preview-${Date.now()}`);

  await fs.writeFile(`${outputBase}.txt`, prompt, "utf-8");
  await fs.writeFile(
    `${outputBase}.json`,
    JSON.stringify({ match, recentMatchContext, config }, null, 2),
    "utf-8"
  );

  console.log(`Barcelona vs ${match.opponent}`);
  console.log(`Kickoff: ${match.day}, ${match.date}, ${match.kickoffTime} (America/Los_Angeles)`);
  console.log(`Barcelona players: ${config.featuredBarcelonaPlayers.join(", ")}`);
  console.log(`Opponent players: ${config.featuredOpponentPlayers.join(", ") || "none"}`);
  console.log(`Match source: ${recentMatchContext?.sourceUrl ?? "none"}`);
  console.log(`Prompt saved: ${outputBase}.txt`);
  console.log(`Context saved: ${outputBase}.json`);

  if (!process.argv.includes("--generate")) {
    console.log("Dry run complete. Add --generate to call the image API and save a poster.");
    return;
  }

  console.log("Generating one local poster preview...");
  await generatePosterImage(prompt, `${outputBase}.png`);
  console.log(`Poster saved: ${outputBase}.png`);
}

main().catch((error) => {
  console.error("Poster preview failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
