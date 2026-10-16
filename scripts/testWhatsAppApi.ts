import "dotenv/config";

async function main() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_TEST_RECIPIENT;

  if (!accessToken) {
    throw new Error("Missing WHATSAPP_ACCESS_TOKEN");
  }

  if (!phoneNumberId) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!recipient) {
    throw new Error("Missing WHATSAPP_TEST_RECIPIENT");
  }

  const response = await fetch(
    `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp API error:", data);
    throw new Error("WhatsApp test message failed");
  }

  console.log("WhatsApp test message sent:");
  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});