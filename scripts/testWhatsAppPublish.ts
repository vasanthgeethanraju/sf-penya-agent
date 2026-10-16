import "dotenv/config";

import { publishSandboxWhatsApp } from "../src/sandbox/publishSandboxWhatsApp";

async function main() {
  const result =
    await publishSandboxWhatsApp(
      "Hi culés! This is a test message from the SF Penya Agent. 🔵🔴"
    );

  console.log(
    "WhatsApp sandbox message sent:"
  );

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});