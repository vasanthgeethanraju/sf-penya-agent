import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export async function getGmailAuth(): Promise<OAuth2Client> {
  const clientId =
    process.env.GMAIL_CLIENT_ID;

  const clientSecret =
    process.env.GMAIL_CLIENT_SECRET;

  const refreshToken =
    process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId) {
    throw new Error(
      "Missing GMAIL_CLIENT_ID"
    );
  }

  if (!clientSecret) {
    throw new Error(
      "Missing GMAIL_CLIENT_SECRET"
    );
  }

  if (!refreshToken) {
    throw new Error(
      "Missing GMAIL_REFRESH_TOKEN"
    );
  }

  const client = new google.auth.OAuth2(
    clientId,
    clientSecret
  );

  client.setCredentials({
    refresh_token: refreshToken,
  });

  return client;
}