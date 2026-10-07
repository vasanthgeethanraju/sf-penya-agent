import "dotenv/config";
import { generateWhatsAppMessage } from "./ai";

const match = {
  opponent: "Real Madrid",
  competition: "La Liga",
  date: "10/25/2026",
  day: "Sunday",
  kickoffTime: "1:00 PM",
  venue: "Mad Dog in the Fog",
};

async function main() {
  const message = await generateWhatsAppMessage(match);

  console.log(message);
}

main();