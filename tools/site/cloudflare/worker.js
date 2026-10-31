import { onRequestGet, onRequestHead } from './functions/r/[[path]].js';

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (!path.startsWith('/r/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const context = {
      request, env, params: { path: path.slice(3).replace(/\/$/, '').split('/') },
      waitUntil: promise => ctx.waitUntil(promise),
    };
    return request.method === 'HEAD' ? onRequestHead(context) : onRequestGet(context);
  },
};
