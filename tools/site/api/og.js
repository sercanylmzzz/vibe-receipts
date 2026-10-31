import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from '@vercel/og';
import { renderReceiptImage } from './_card.js';

const font = f => readFileSync(join(process.cwd(), 'fonts', f));
const FONTS = [
  { name: 'Geist', data: font('Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
  { name: 'Geist Mono', data: font('GeistMono-Medium.ttf'), weight: 500, style: 'normal' },
  { name: 'Geist Mono', data: font('GeistMono-Bold.ttf'), weight: 700, style: 'normal' },
];

export function GET(request) {
  return renderReceiptImage(request, ImageResponse, FONTS);
}
