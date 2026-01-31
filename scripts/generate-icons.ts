// Generate simple SVG icons for PWA
import { writeFileSync } from 'fs';
import { join } from 'path';

const svgIcon = (size: number) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="50%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#1a1a2e"/>
  <g transform="translate(${size * 0.2}, ${size * 0.25})">
    <circle cx="${size * 0.2}" cy="${size * 0.22}" r="${size * 0.03}" fill="white"/>
    <circle cx="${size * 0.4}" cy="${size * 0.22}" r="${size * 0.03}" fill="white"/>
    <path d="M${size * 0.17} ${size * 0.35} Q${size * 0.3} ${size * 0.45} ${size * 0.43} ${size * 0.35}" stroke="white" stroke-width="${size * 0.025}" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

// Write the SVG icons
const publicDir = join(process.cwd(), 'client', 'public');

writeFileSync(join(publicDir, 'icon-192.svg'), svgIcon(192));
writeFileSync(join(publicDir, 'icon-512.svg'), svgIcon(512));

console.log('SVG icons generated successfully!');

// Note: For proper PWA support, these SVG files would need to be converted to PNG
// In production, use a service like squoosh or sharp to convert them
