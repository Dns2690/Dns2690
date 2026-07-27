import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#111827"/>
  <g stroke="#22d3ee" stroke-width="34" stroke-linecap="round">
    <line x1="96" y1="256" x2="416" y2="256"/>
  </g>
  <g fill="#22d3ee">
    <rect x="60" y="176" width="46" height="160" rx="14"/>
    <rect x="20" y="206" width="34" height="100" rx="12"/>
    <rect x="406" y="176" width="46" height="160" rx="14"/>
    <rect x="458" y="206" width="34" height="100" rx="12"/>
  </g>
</svg>
`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#111827"/>
  <g stroke="#22d3ee" stroke-width="28" stroke-linecap="round">
    <line x1="146" y1="256" x2="366" y2="256"/>
  </g>
  <g fill="#22d3ee">
    <rect x="118" y="196" width="38" height="120" rx="12"/>
    <rect x="88" y="216" width="26" height="80" rx="10"/>
    <rect x="356" y="196" width="38" height="120" rx="12"/>
    <rect x="398" y="216" width="26" height="80" rx="10"/>
  </g>
</svg>
`;

mkdirSync('public/icons', { recursive: true });

const jobs = [
  ['public/icons/icon-192.png', svg, 192],
  ['public/icons/icon-512.png', svg, 512],
  ['public/icons/maskable-512.png', maskableSvg, 512],
  ['public/icons/apple-touch-icon.png', svg, 180],
];

for (const [out, src, size] of jobs) {
  await sharp(Buffer.from(src)).resize(size, size).png().toFile(out);
  console.log('wrote', out);
}
