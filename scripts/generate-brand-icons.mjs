import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = new URL('../public/brand/schedmaster-symbol.svg', import.meta.url);

async function renderIcon(size) {
  // Transparent clear space; never add a white canvas around the artwork.
  const art = await sharp(fileURLToPath(source))
    .resize(Math.round(size * 0.84), Math.round(size * 0.84), { fit: 'inside' })
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toBuffer();
}

function makeIco(frames) {
  const directory = Buffer.alloc(6 + 16 * frames.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(frames.length, 4);
  let offset = directory.length;

  frames.forEach(({ size, png }, index) => {
    const entry = 6 + index * 16;
    directory[entry] = size;
    directory[entry + 1] = size;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });

  return Buffer.concat([directory, ...frames.map(({ png }) => png)]);
}

await Promise.all([
  ...[192, 512].map(async (size) => {
    await writeFile(new URL(`../public/brand/schedmaster-icon-${size}.png`, import.meta.url), await renderIcon(size));
  }),
  renderIcon(180).then((png) => writeFile(new URL('../app/apple-icon.png', import.meta.url), png)),
  Promise.all([16, 32, 48].map(async (size) => ({ size, png: await renderIcon(size) })))
    .then((frames) => writeFile(new URL('../app/favicon.ico', import.meta.url), makeIco(frames))),
]);

console.log('Generated SchedMaster favicon, Apple icon, and PWA icons.');
