const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");

// Create a simple icon SVG
const iconSvg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#ffffff" text-anchor="middle">NC</text>
</svg>
`;

async function generateIcons() {
  const svgBuffer = Buffer.from(iconSvg);

  // Generate 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192x192.png"));

  // Generate 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512x512.png"));

  // Generate Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  console.log("✓ PWA icons generated successfully!");
}

generateIcons().catch(console.error);

