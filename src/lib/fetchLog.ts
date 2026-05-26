export interface FetchResult {
  text: string;
  via: 'direct' | 'corsproxy.io' | 'allorigins';
}

const PROXIES = [
  {
    name: 'corsproxy.io' as const,
    build: (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  },
  {
    name: 'allorigins' as const,
    build: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  },
];

export async function fetchLogFromUrl(url: string): Promise<FetchResult> {
  const u = validateUrl(url);
  const internal = isLikelyInternalHost(u.host);

  const errors: string[] = [];

  // 1. Try direct fetch first (works if target sends Access-Control-Allow-Origin).
  try {
    const r = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (r.ok) {
      const text = await r.text();
      return { text, via: 'direct' };
    }
    errors.push(`direct: HTTP ${r.status}`);
  } catch (e) {
    errors.push(`direct: ${(e as Error).message}`);
  }

  // 2. Fall back to public CORS proxies — only useful for hosts reachable from
  // the public internet. Skip these for obviously internal hosts.
  if (!internal) {
    for (const proxy of PROXIES) {
      try {
        const r = await fetch(proxy.build(url), { credentials: 'omit' });
        if (r.ok) {
          const text = await r.text();
          return { text, via: proxy.name };
        }
        errors.push(`${proxy.name}: HTTP ${r.status}`);
      } catch (e) {
        errors.push(`${proxy.name}: ${(e as Error).message}`);
      }
    }
  }

  const lines = [
    internal
      ? `“${u.host}” looks like an internal/corporate host — public CORS proxies cannot reach it.`
      : `Could not fetch the URL. Tried direct and ${PROXIES.length} CORS proxies.`,
    ...errors.map((e) => `  • ${e}`),
    '',
    'If this is the KPU registry dashboard, the page injects the data as `window.__EXECUTION_PAYLOAD__`.',
    'Open the dashboard, View Source (⌥⌘U) or save the page, then paste the HTML in the Paste tab — it’ll be extracted automatically.',
  ];

  throw new Error(lines.join('\n'));
}

const INTERNAL_TLDS = ['.corp', '.local', '.lan', '.internal', '.intranet'];
const INTERNAL_HOST_HINTS = ['localhost', '.oke.', 'kubernetes.default'];

function isLikelyInternalHost(host: string): boolean {
  const h = host.toLowerCase();
  if (INTERNAL_TLDS.some((t) => h.endsWith(t))) return true;
  if (INTERNAL_HOST_HINTS.some((s) => h.includes(s))) return true;
  // Private IPv4 ranges.
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function validateUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('Not a valid URL.');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are supported.');
  }
  return u;
}
