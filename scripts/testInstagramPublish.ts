import "dotenv/config";
import { publishSandboxInstagram } from "../src/sandbox/publishSandboxInstagram";

async function main() {
  const posterUrl = process.env.INSTAGRAM_TEST_POSTER_URL;

  if (!posterUrl) {
    throw new Error(
      "Missing INSTAGRAM_TEST_POSTER_URL"
    );
  }

  const result = await publishSandboxInstagram({
    posterUrl,
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