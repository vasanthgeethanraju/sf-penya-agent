import fs from "node:fs/promises";
import path from "node:path";

import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
];

const TOKEN_PATH = path.join(
  process.cwd(),
  "token.json"
);

const CREDENTIALS_PATH = path.join(
  process.cwd(),
  "credentials.json"
);

async function loadSavedCredentials():
  Promise<OAuth2Client | null> {
  try {
    const tokenContent = await fs.readFile(
      TOKEN_PATH,
      "utf-8"
    );

    const credentialsContent =
      await fs.readFile(
        CREDENTIALS_PATH,
        "utf-8"
      );

    const token = JSON.parse(tokenContent);
    const credentials =
      JSON.parse(credentialsContent);

    const key =
      credentials.installed ??
      credentials.web;

    const client = new google.auth.OAuth2(
      key.client_id,
      key.client_secret,
      key.redirect_uris?.[0]
    );

    client.setCredentials(token);

    return client;
  } catch {
    return null;
  }
}

async function saveCredentials(
  client: OAuth2Client
) {
  await fs.writeFile(
    TOKEN_PATH,
    JSON.stringify(
      client.credentials,
      null,
      2
    ),
    "utf-8"
  );
}

export async function getGmailAuth():
  Promise<OAuth2Client> {
  const savedClient =
    await loadSavedCredentials();

  if (savedClient) {
    return savedClient;
  }

  const authenticatedClient =
    await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

  await saveCredentials(
    authenticatedClient
  );

  return authenticatedClient;
}