import "dotenv/config";
import { generateMatchDayContent } from "./ai";

const match = {
  opponent: "Real Madrid",
  competition: "La Liga",
  date: "10/25/2026",
  day: "Sunday",
  kickoffTime: "1:00 PM",
  venue: "Mad Dog in the Fog",
};

async function main() {
  const content = await generateMatchDayContent(match);

  console.log("\nWHATSAPP\n");
  console.log(content.whatsapp);

  console.log("\nINSTAGRAM\n");
  console.log(content.instagram);

  console.log("\nEMAIL SUBJECT\n");
  console.log(content.emailSubject);

  console.log("\nEMAIL BODY\n");
  console.log(content.emailBody);
}

main();