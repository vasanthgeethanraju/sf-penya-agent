type PublishSandboxWhatsAppResult = {
  messageId: string;
  recipient: string;
};

export async function publishSandboxWhatsApp(
  message: string
): Promise<PublishSandboxWhatsAppResult> {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  const recipient =
    process.env.WHATSAPP_TEST_RECIPIENT;

  if (!accessToken) {
    throw new Error(
      "Missing WHATSAPP_ACCESS_TOKEN"
    );
  }

  if (!phoneNumberId) {
    throw new Error(
      "Missing WHATSAPP_PHONE_NUMBER_ID"
    );
  }

  if (!recipient) {
    throw new Error(
      "Missing WHATSAPP_TEST_RECIPIENT"
    );
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
        recipient_type: "individual",
        to: recipient,
        type: "text",

        text: {
          preview_url: false,
          body: message,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "WhatsApp publish error:",
      data
    );

    throw new Error(
      "Failed to publish WhatsApp message"
    );
  }

  const messageId =
    data.messages?.[0]?.id;

  if (!messageId) {
    throw new Error(
      "WhatsApp did not return a message ID"
    );
  }

  return {
    messageId,
    recipient,
  };
}