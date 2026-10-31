import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderReceiptPage } from './_page.js';

const page = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

export function GET(request) {
  return renderReceiptPage(request, page);
}
