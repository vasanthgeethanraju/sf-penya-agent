import "dotenv/config";
import { publishSandboxInstagram } from "../src/sandbox/publishSandboxInstagram";

async function main() {
  const result = await publishSandboxInstagram({
    posterPath: "./generated/match-day-poster.png",
    caption:
      "SF Penya Agent sandbox test ⚽️🔵🔴\n\nAutomated test post.",
  });

  console.log("Instagram post published:");
  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});