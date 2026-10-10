import "dotenv/config";

import { prepareNextMatchDayContent } from "./agent";
import { createApprovalPackage } from "./approval/createApprovalPackage";
import { buildApprovalEmail } from "./approval/buildApprovalEmail";
import { sendApprovalEmail } from "./email/sendApprovalEmail";
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

  let posterPath: string | null = null;

  if (shouldGeneratePoster) {
    try {
      const posterConfig =
        buildPosterConfig(match);

      const posterPrompt =
        buildPosterPrompt(
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

      const generatedPosterPath =
        "./generated/match-day-poster.png";

      await generatePosterImage(
        posterPrompt,
        generatedPosterPath
      );

      posterPath = generatedPosterPath;

      console.log(
        `Poster saved to ${posterPath}`
      );
    } catch (error) {
      console.error(
        "\nPoster generation failed. Continuing without poster.\n"
      );

      console.error(error);

      posterPath = null;
    }
  } else {
    console.log(
      "\nPoster generation skipped."
    );
  }

  const approvalPackage =
    await createApprovalPackage({
      match,
      weather,
      events,
      transitAlerts,
      content,
      posterPath,
    });

  const approvalEmail =
    buildApprovalEmail(
      approvalPackage
    );

  console.log("\nAPPROVAL EMAIL\n");

  console.log("Subject:");
  console.log(
    approvalEmail.subject
  );

  const approverEmail =
    process.env.APPROVER_EMAIL;

  if (!approverEmail) {
    throw new Error(
      "APPROVER_EMAIL is missing."
    );
  }

  console.log(
    "\nSending approval email..."
  );

  const sentEmail =
    await sendApprovalEmail(
      approverEmail,
      approvalEmail.subject,
      approvalEmail.html,
      approvalPackage.posterPath
    );

  console.log(
    "Approval email sent:",
    sentEmail
  );

  console.log(
    "\nApproval package saved:"
  );

  console.log({
    id: approvalPackage.id,
    status: approvalPackage.status,
    posterPath:
      approvalPackage.posterPath,
  });
}

main().catch((error) => {
  console.error(
    "\nSF Penya Agent failed:\n"
  );

  console.error(error);

  process.exit(1);
});