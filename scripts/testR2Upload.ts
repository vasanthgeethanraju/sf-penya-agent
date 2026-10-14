import "dotenv/config";
import { uploadPoster } from "../src/storage/uploadPoster";

async function main() {
  const imageUrl = await uploadPoster(
    "./generated/match-day-poster.png"
  );

  console.log("Uploaded poster:");
  console.log(imageUrl);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});