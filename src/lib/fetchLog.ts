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
  validateUrl(url);

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

  // 2. Fall back to public CORS proxies.
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

  throw new Error(
    `Could not fetch the URL. Tried direct and ${PROXIES.length} CORS proxies.\n` +
      errors.map((e) => `  • ${e}`).join('\n') +
      `\nWorkaround: download the file manually and use Upload or Paste.`,
  );
}

function validateUrl(raw: string): void {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('Not a valid URL.');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are supported.');
  }
}
