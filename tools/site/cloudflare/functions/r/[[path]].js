import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api';
import { renderReceiptPage } from '../../../api/_page.js';
import { renderReceiptImage } from '../../../api/_card.js';
import { decode } from '../../../api/_receipt.js';

let pagePromise;
let fontsPromise;

async function asset(env, request, path) {
  const response = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
  if (!response.ok) throw new Error(`Missing site asset: ${path}`);
  return response;
}

function fonts(env, request) {
  return fontsPromise ??= Promise.all([
    ['Geist', 'Geist-SemiBold.ttf', 600],
    ['Geist Mono', 'GeistMono-Medium.ttf', 500],
    ['Geist Mono', 'GeistMono-Bold.ttf', 700],
  ].map(async ([name, file, weight]) => ({
    name, weight, style: 'normal',
    data: await (await asset(env, request, `/fonts/${file}`)).arrayBuffer(),
  }))).catch(error => { fontsPromise = undefined; throw error; });
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const parts = params.path;
  const isImage = parts.length === 2 && parts[1] === 'og.png';
  if (parts.length !== 1 && !isImage) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  if (!decode(parts[0])) {
    return isImage ? new Response('Not a receipt', { status: 404 }) : Response.redirect(new URL('/', url), 302);
  }
  url.searchParams.set('d', parts[0]);
  const receiptRequest = new Request(url);
  if (isImage) {
    const key = new Request(new URL(request.url).origin + new URL(request.url).pathname);
    const cached = await caches.default.match(key);
    if (cached) return cached;
    const response = renderReceiptImage(receiptRequest, ImageResponse, await fonts(env, request));
    context.waitUntil(caches.default.put(key, response.clone()));
    return response;
  }
  const page = await (pagePromise ??= asset(env, request, '/').then(response => response.text())
    .catch(error => { pagePromise = undefined; throw error; }));
  return renderReceiptPage(receiptRequest, page);
}

export async function onRequestHead(context) {
  const response = await onRequestGet(context);
  return new Response(null, response);
}
