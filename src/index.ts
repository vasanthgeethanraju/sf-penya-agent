import "dotenv/config";
import { prepareNextMatchDayContent } from "./agent";

async function main() {
  const content = await prepareNextMatchDayContent();

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