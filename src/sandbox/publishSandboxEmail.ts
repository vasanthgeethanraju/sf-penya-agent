import { google } from "googleapis";

import type { ApprovalPackage } from "../approval/approvalTypes";
import { getGmailAuth } from "../email/getGmailAuth";

function encodeMessage(message: string) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function publishSandboxEmail(
  approvalPackage: ApprovalPackage
) {
  const recipients =
    process.env.SANDBOX_EMAIL_RECIPIENTS
      ?.split(",")
      .map((email) => email.trim())
      .filter(Boolean);

  if (!recipients?.length) {
    throw new Error(
      "SANDBOX_EMAIL_RECIPIENTS is missing."
    );
  }

  const auth = await getGmailAuth();

  const gmail = google.gmail({
    version: "v1",
    auth,
  });

  const subject =
    `[SANDBOX] ${approvalPackage.content.emailSubject}`;

  const body = approvalPackage.content.emailBody;

  const email = [
    `To: ${recipients.join(", ")}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  const encodedMessage =
    encodeMessage(email);

  const response =
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

  return {
    messageId: response.data.id ?? null,
    recipients,
  };
}