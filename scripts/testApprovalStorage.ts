import "dotenv/config";

import {
  loadApprovalPackage,
  saveApprovalPackage,
} from "../src/storage/approvalStorage";

async function main() {
  const testApproval = {
    id: "test-r2-approval",
    createdAt: new Date().toISOString(),
    status: "pending",

    match: {
      opponent: "Test Opponent",
      competition: "Test Competition",
      date: "2026-10-17",
      day: "Saturday",
      kickoffTime: "9:30 AM",
      matchVenue: "Test Stadium",
      watchVenue: "Mad Dog in the Fog",
      isHomeGame: false,
    },

    weather: null,
    events: [],
    transitAlerts: [],

    content: {
      whatsapp: "Test WhatsApp",
      instagram: "Test Instagram",
      emailSubject: "Test Email",
      emailBody: "Test body",
    },

    posterPath: null,
    notes: [],
  } as any;

  await saveApprovalPackage(
    testApproval
  );

  console.log(
    "Approval saved to R2."
  );

  const loaded =
    await loadApprovalPackage(
      testApproval.id
    );

  console.log(
    "Approval loaded from R2:"
  );

  console.log(loaded);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});