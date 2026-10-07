export function isVisitorRequestAllowed(request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return false;
  // Browsers set this protected header using the public URL. Netlify can
  // rewrite request.url to an internal origin before invoking the handler.
  if (fetchSite === 'same-origin') return true;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}
