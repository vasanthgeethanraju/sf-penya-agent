import "dotenv/config";

import { prepareNextMatchDayContent } from "./agent";
import { createApprovalPackage } from "./approval/createApprovalPackage";
import { buildApprovalEmail } from "./approval/buildApprovalEmail";
import { sendApprovalEmail } from "./email/sendApprovalEmail";
import { buildPosterConfig } from "./poster/buildPosterConfig";
import { buildPosterPrompt } from "./poster/buildPosterPrompt";
import { generatePosterImage } from "./poster/generatePosterImage";

async function main() {
  console.log("\nPreparing SF Penya match-day package...");

  const {
    match,
    weather,
    events,
    transitAlerts,
    content,
  } = await prepareNextMatchDayContent();

  console.log(
    `Context loaded: Barça vs ${match.opponent}, ${match.day} at ${match.kickoffTime}`
  );

  console.log("Match-day content generated.");

  const shouldGeneratePoster =
    process.env.GENERATE_POSTER === "true";

  let posterPath: string | null = null;

  if (shouldGeneratePoster) {
    try {
      console.log("Generating poster...");

      const posterConfig =
        buildPosterConfig(match);

      const posterPrompt =
        buildPosterPrompt(
          match,
          posterConfig
        );

      const generatedPosterPath =
        "./generated/match-day-poster.png";

      await generatePosterImage(
        posterPrompt,
        generatedPosterPath
      );

      posterPath = generatedPosterPath;

      console.log(
        `Poster generated: ${posterPath}`
      );
    } catch (error) {
      console.error(
        "Poster generation failed. Continuing without poster."
      );

      console.error(error);

      posterPath = null;
    }
  } else {
    console.log("Poster generation skipped.");
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

  console.log(
    `Approval package created: ${approvalPackage.id}`
  );

  const approvalEmail =
    buildApprovalEmail(
      approvalPackage
    );

  const approverEmail =
    process.env.APPROVER_EMAIL;

  if (!approverEmail) {
    throw new Error(
      "APPROVER_EMAIL is missing."
    );
  }

  console.log("Sending approval email...");

  const sentEmail =
    await sendApprovalEmail(
      approverEmail,
      approvalEmail.subject,
      approvalEmail.html,
      approvalPackage.posterPath
    );

  console.log(
    `Approval email sent. Gmail message ID: ${sentEmail.messageId}`
  );

  console.log("\nMatch-day package ready for approval.");

  console.log({
    approvalId: approvalPackage.id,
    status: approvalPackage.status,
    posterIncluded:
      approvalPackage.posterPath !== null,
  });
}

main().catch((error) => {
  console.error(
    "\nSF Penya Agent failed:"
  );

  console.error(error);

  process.exit(1);
});