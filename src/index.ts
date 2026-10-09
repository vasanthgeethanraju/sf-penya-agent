import "dotenv/config";

import { prepareNextMatchDayContent } from "./agent";
import { buildPosterConfig } from "./poster/buildPosterConfig";
import { buildPosterPrompt } from "./poster/buildPosterPrompt";
import { generatePosterImage } from "./poster/generatePosterImage";

async function main() {
  const {
    match,
    weather,
    events,
    transitAlerts,
    content,
  } = await prepareNextMatchDayContent();

  console.log("\nMATCH\n");
  console.log(match);

  console.log("\nWEATHER\n");
  console.log(weather);

  console.log("\nEVENTS\n");
  console.log(events);

  console.log("\nTRANSIT ALERTS\n");
  console.log(transitAlerts);

  console.log("\nWHATSAPP\n");
  console.log(content.whatsapp);

  console.log("\nINSTAGRAM\n");
  console.log(content.instagram);

  console.log("\nEMAIL SUBJECT\n");
  console.log(content.emailSubject);

  console.log("\nEMAIL BODY\n");
  console.log(content.emailBody);

  const shouldGeneratePoster =
  process.env.GENERATE_POSTER === "true";

  if (shouldGeneratePoster) {
    const posterConfig = buildPosterConfig(match);

    const posterPrompt = buildPosterPrompt(
      match,
      posterConfig
    );

    console.log("\nPOSTER CONFIG\n");
    console.log(posterConfig);

    console.log("\nGenerating poster...");
    console.log(
      "Players:",
      posterConfig.featuredBarcelonaPlayers
    );

    const outputPath =
      "./generated/match-day-poster.png";

    await generatePosterImage(
      posterPrompt,
      outputPath
    );

    console.log(
      `Poster saved to ${outputPath}`
    );
  } else {
    console.log(
      "\nPoster generation skipped."
    );
  }
}

main().catch((error) => {
  console.error("\nSF Penya Agent failed:\n");
  console.error(error);

  process.exit(1);
});