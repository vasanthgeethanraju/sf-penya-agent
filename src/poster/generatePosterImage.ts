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

${prompt}
`,

    size: "1024x1536",
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