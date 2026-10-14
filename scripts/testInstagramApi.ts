import "dotenv/config";

async function main() {
  const accessToken = process.env.INSTAGRAM_SANDBOX_ACCESS_TOKEN;
  const instagramAccountId =
    process.env.INSTAGRAM_SANDBOX_ACCOUNT_ID;

  if (!accessToken) {
    throw new Error(
      "Missing INSTAGRAM_SANDBOX_ACCESS_TOKEN in .env"
    );
  }

  if (!instagramAccountId) {
    throw new Error(
      "Missing INSTAGRAM_SANDBOX_ACCOUNT_ID in .env"
    );
  }

  const url =
    `https://graph.instagram.com/${instagramAccountId}` +
    `?fields=id,username&access_token=${accessToken}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error("Instagram API request failed");
  }

  console.log("Instagram API connected:");
  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});