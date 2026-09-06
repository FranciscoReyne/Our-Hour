import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPNG(width, height, getPixel) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with 0x00 filter byte per row
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(r)));
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(g)));
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(b)));
      rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Procedural renderer for OurHour Watch Icon
function renderOurHourIcon(isMaskable = false, isRound = false) {
  return (x, y, w, h) => {
    // Normalize coordinates to -1 to +1
    const nx = (x / (w - 1)) * 2 - 1;
    const ny = (y / (h - 1)) * 2 - 1;
    const scale = isMaskable ? 0.75 : 0.92;
    const px = nx / scale;
    const py = ny / scale;
    const dist = Math.sqrt(px * px + py * py);

    // Background: Dark Sapphire Gradient
    const bgDist = Math.sqrt(nx * nx + ny * ny);
    if (isRound && bgDist > 0.98) {
      return [0, 0, 0, 0]; // Transparent outside circle if round
    }

    // Base background color #070B14 -> #030712
    let r = 11 + (3 - 11) * (bgDist * 0.5);
    let g = 15 + (7 - 15) * (bgDist * 0.5);
    let b = 25 + (18 - 25) * (bgDist * 0.5);
    let a = 255;

    // Outer subtle dial ring
    if (dist >= 0.88 && dist <= 0.92) {
      const ringAlpha = 0.4;
      r = r * (1 - ringAlpha) + 51 * ringAlpha;
      g = g * (1 - ringAlpha) + 65 * ringAlpha;
      b = b * (1 - ringAlpha) + 85 * ringAlpha;
    }

    // Dual-colored Circadian Halo: Top half Golden Sun, Bottom half Indigo Night
    if (dist >= 0.70 && dist <= 0.82) {
      const arcFactor = (0.06 - Math.abs(dist - 0.76)) / 0.06;
      if (py <= 0) {
        // Daylight arc (Golden amber #F59E0B -> #FBBF24)
        const glow = Math.max(0, arcFactor);
        r = r * (1 - glow) + 245 * glow;
        g = g * (1 - glow) + 158 * glow;
        b = b * (1 - glow) + 11 * glow;
      } else {
        // Night arc (Indigo #6366F1 -> #8B5CF6)
        const glow = Math.max(0, arcFactor);
        r = r * (1 - glow) + 99 * glow;
        g = g * (1 - glow) + 102 * glow;
        b = b * (1 - glow) + 241 * glow;
      }
    }

    // Inner watch dial center #0B132B
    if (dist < 0.65) {
      r = 11;
      g = 19;
      b = 43;
    }

    // Sun at top (Solar Noon): centered at (0, -0.28), radius 0.18
    const sunDist = Math.sqrt(px * px + (py + 0.28) * (py + 0.28));
    if (sunDist < 0.18) {
      const sunCore = Math.max(0, 1 - sunDist / 0.18);
      r = r * (1 - sunCore) + 251 * sunCore;
      g = g * (1 - sunCore) + 191 * sunCore;
      b = b * (1 - sunCore) + 36 * sunCore;
    }

    // Moon at bottom (Solar Nadir): centered at (0, 0.30), crescent shape
    const moonDist1 = Math.sqrt((px - 0.02) * (px - 0.02) + (py - 0.30) * (py - 0.30));
    const moonDist2 = Math.sqrt((px + 0.06) * (px + 0.06) + (py - 0.26) * (py - 0.26));
    if (moonDist1 < 0.16 && moonDist2 > 0.14) {
      const moonCore = Math.min(1, Math.max(0, (0.16 - moonDist1) * 10));
      r = r * (1 - moonCore) + 199 * moonCore;
      g = g * (1 - moonCore) + 210 * moonCore;
      b = b * (1 - moonCore) + 254 * moonCore;
    }

    // Center Meridian Nexus Pin
    if (dist < 0.04) {
      r = 248;
      g = 250;
      b = 252;
    }

    return [r, g, b, a];
  };
}

const outDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
const icon192 = createPNG(192, 192, renderOurHourIcon(false));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);

// Generate 512x512
const icon512 = createPNG(512, 512, renderOurHourIcon(false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);

// Generate 512x512 Maskable
const iconMaskable = createPNG(512, 512, renderOurHourIcon(true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), iconMaskable);

// Generate 180x180 Apple Touch Icon
const appleTouchIcon = createPNG(180, 180, renderOurHourIcon(false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouchIcon);

// Copy to assets directory as well for redundancy
const assetsDir = path.resolve(__dirname, '../assets');
fs.writeFileSync(path.join(assetsDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(assetsDir, 'icon-512.png'), icon512);

// Generate Android Mipmap launcher icons
const mipmapSizes = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 }
];

const resDir = path.resolve(__dirname, '../android/app/src/main/res');
for (const item of mipmapSizes) {
  const targetDir = path.join(resDir, item.dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const img = createPNG(item.size, item.size, renderOurHourIcon(false));
  fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), img);
}

console.log('Successfully generated all PWA and Android icons!');

