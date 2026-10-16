import "dotenv/config";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

export async function generatePosterImage(
  prompt: string,
  outputPath: string
) {
  const penyaLogo = await toFile(
    fs.createReadStream("assets/penya/logo.png"),
    null,
    {
      type: "image/png",
    }
  );

  const response = await client.images.edit({
    model: "gpt-image-2.5-flare",

    image: penyaLogo,

    prompt: `
Use the provided image as the official
Penya Barcelonista San Francisco logo.

Preserve the logo design accurately.
Do not redesign, replace, or invent a different Penya logo.

Design the poster for a 4:5 vertical Instagram feed post.

Keep all important content comfortably inside the frame.
Do not place logos, players, date, kickoff time, venue,
address, or other important text too close to the top or bottom edges.

${prompt}
`,

    size: "1024x1280",
    quality: "medium",
    output_format: "png",
  });

  const imageBase64 =
    response.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error(
      "Image generation did not return image data."
    );
  }

  const imageBuffer = Buffer.from(
    imageBase64,
    "base64"
  );

  await fsPromises.writeFile(
    outputPath,
    imageBuffer
  );

  return outputPath;
}