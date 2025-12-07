import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Wankul Pocket";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Lire l'image statique depuis le dossier public
  const imagePath = join(process.cwd(), "public", "OGImage.png");
  const imageBuffer = await readFile(imagePath);

  // Retourner l'image directement
  return new Response(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
