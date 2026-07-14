const API_ORIGIN = 'http://3.216.152.235';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api')) {
      const upstreamUrl = new URL(url.pathname.replace(/^\/api/, '') || '/', API_ORIGIN);
      upstreamUrl.search = url.search;

      const headers = new Headers(request.headers);
      headers.delete('host');

      return fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual',
      });
    }

    return env.ASSETS.fetch(request);
  },
};
