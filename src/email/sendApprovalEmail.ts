import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";

import { getGmailAuth } from "./getGmailAuth";

function encodeMessage(message: string) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendApprovalEmail(
  to: string,
  subject: string,
  html: string,
  posterPath?: string | null
) {
  const auth = await getGmailAuth();

  const gmail = google.gmail({
    version: "v1",
    auth,
  });

  const boundary =
    `boundary_${Date.now()}`;

  const subjectEncoded =
    `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const parts: string[] = [
    `To: ${to}`,
    `Subject: ${subjectEncoded}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    html,
  ];

  if (posterPath) {
    const absolutePosterPath =
      path.resolve(posterPath);

    const posterBuffer =
      await fs.readFile(absolutePosterPath);

    const posterBase64 =
      posterBuffer.toString("base64");

    parts.push(
      `--${boundary}`,
      `Content-Type: image/png; name="match-day-poster.png"`,
      `Content-Disposition: inline; filename="match-day-poster.png"`,
      `Content-Transfer-Encoding: base64`,
      `Content-ID: <match-poster>`,
      "",
      posterBase64
    );
  }

  parts.push(
    `--${boundary}--`,
    ""
  );

  const rawEmail =
    parts.join("\r\n");

  const encodedMessage =
    encodeMessage(rawEmail);

  const response =
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

  return {
    messageId:
      response.data.id ?? null,
  };
}