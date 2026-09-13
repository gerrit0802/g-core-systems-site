// One empty first-party request per page load. No user/device data or identifiers.
(() => {
  const url = new URL(window.location.href);
  if (url.protocol !== 'https:' || !['g-core-systems.com', 'www.g-core-systems.com'].includes(url.hostname)) return;
  if (url.pathname !== '/' && url.pathname !== '/index.html') return;
  if (url.searchParams.has('preview') || url.searchParams.has('no-count')) return;
  if (typeof window.fetch !== 'function' || typeof AbortController !== 'function') return;
  let sent = false;
  const count = () => {
    if (sent || document.visibilityState !== 'visible' || document.prerendering) return;
    sent = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    window.fetch('https://api.g-core-systems.com/site-views/v1', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      cache: 'no-store', mode: 'cors', signal: controller.signal,
    }).catch(() => {}).finally(() => clearTimeout(timeout));
  };
  count();
  document.addEventListener('visibilitychange', count);
  document.addEventListener('prerenderingchange', count);
})();
