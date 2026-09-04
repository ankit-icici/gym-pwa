import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';

/* Minimal RGBA PNG encoder (no deps) + a 4x supersampled rasteriser,
   so the icons are generated from source rather than checked in as blobs. */
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                                   // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
const TBL = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
function crc32(buf) { let c = -1; for (const b of buf) c = TBL[(c ^ b) & 255] ^ (c >>> 8); return c ^ -1; }

/* Signed-distance helpers in normalised 0..1 space. */
const rrect = (x, y, cx, cy, hw, hh, r) => {
  const dx = Math.abs(x - cx) - (hw - r), dy = Math.abs(y - cy) - (hh - r);
  const ax = Math.max(dx, 0), ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - r;
};

const BG = [0x0E, 0x10, 0x15];
const FG = [0xFF, 0x7A, 0x45];

function render(size, { maskable = false } = {}) {
  const SS = 4, W = size * SS;
  const out = Buffer.alloc(size * size * 4);
  // A maskable icon is edge-to-edge and keeps its glyph inside the safe zone.
  const pad = maskable ? 0 : 0;
  const corner = maskable ? 0.5 : 0.225;
  const s = maskable ? 0.72 : 1;   // shrink the glyph for the maskable safe area

  const glyph = (x, y) => {
    const cx = 0.5, cy = 0.5;
    const X = (x - cx) / s + cx, Y = (y - cy) / s + cy;
    return Math.min(
      rrect(X, Y, .5, .5, .345, .038, .038),   // shaft
      rrect(X, Y, .335, .5, .042, .225, .026), // inner plate, left
      rrect(X, Y, .665, .5, .042, .225, .026), // inner plate, right
      rrect(X, Y, .252, .5, .032, .148, .020), // outer plate, left
      rrect(X, Y, .748, .5, .032, .148, .020), // outer plate, right
    );
  };

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let bgHits = 0, fgHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + .5) / SS) / size;
          const y = (py + (sy + .5) / SS) / size;
          if (rrect(x, y, .5, .5, .5 - pad, .5 - pad, corner) <= 0) bgHits++;
          if (glyph(x, y) <= 0) fgHits++;
        }
      }
      const n = SS * SS;
      const a = bgHits / n, f = fgHits / n;
      const i = (py * size + px) * 4;
      for (let c = 0; c < 3; c++) out[i + c] = Math.round(BG[c] * (1 - f) + FG[c] * f);
      out[i + 3] = Math.round(255 * a);
    }
  }
  return png(size, size, out);
}

const dir = process.argv[2];
writeFileSync(`${dir}/icon-192.png`, render(192));
writeFileSync(`${dir}/icon-512.png`, render(512));
writeFileSync(`${dir}/icon-maskable-512.png`, render(512, { maskable: true }));
writeFileSync(`${dir}/apple-touch-icon.png`, render(180, { maskable: true }));
console.log('icons written');
