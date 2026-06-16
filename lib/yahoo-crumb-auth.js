// lib/yahoo-crumb-auth.js
// Implementasi cookie+crumb authentication untuk Yahoo Finance quoteSummary endpoint
// (endpoint yang punya field floatShares & sharesOutstanding, beda dari endpoint
// v8/finance/chart yang dipakai stock.js — itu endpoint harga, tanpa auth, tanpa field ini).
//
// STATUS: BELUM TERVERIFIKASI BEKERJA. Ini percobaan riset, bukan solusi yang sudah
// dikonfirmasi jalan. Yahoo bisa saja menolak request ini di server Vercel sama seperti
// di banyak environment cloud lain (mereka aktif memblokir scraping non-browser).
// Cache di module-level (in-memory) hanya bertahan selama instance serverless function
// "hangat" (warm) — pada cold start, proses ini akan terulang dari awal.

let cachedAuth = null;
let cacheExpiry = 0;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchCookie() {
  // Strategi 1: fc.yahoo.com (endpoint khusus untuk dapat cookie awal)
  try {
    const res = await fetch('https://fc.yahoo.com', {
      headers: BROWSER_HEADERS,
      redirect: 'manual',
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      return setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
    }
  } catch (e) {
    // lanjut ke fallback
  }

  // Strategi 2 (fallback): finance.yahoo.com biasa
  try {
    const res = await fetch('https://finance.yahoo.com', {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      return setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
    }
  } catch (e) {
    // gagal total
  }

  return null;
}

async function fetchCrumb(cookie) {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { ...BROWSER_HEADERS, 'Cookie': cookie },
    });
    const text = await res.text();

    if (res.ok && !text.includes('<') && !text.toLowerCase().includes('error') && text.length <= 50) {
      return text.trim();
    }

    lastError = `Crumb tidak valid (status ${res.status}, attempt ${attempt}/${maxRetries}): ${text.slice(0, 100)}`;

    if (res.status === 429 && attempt < maxRetries) {
      // Tunggu sebelum retry, untuk membedakan throttle sesaat vs block permanen
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }
    break;
  }

  throw new Error(lastError);
}

/**
 * Dapatkan cookie+crumb, pakai cache in-memory selama instance masih warm.
 * @returns {Promise<{cookie: string, crumb: string}>}
 * @throws Error dengan pesan jelas kalau gagal di tahap manapun
 */
export async function getYahooAuth() {
  const now = Date.now();
  if (cachedAuth && now < cacheExpiry) {
    return cachedAuth;
  }

  const cookie = await fetchCookie();
  if (!cookie) {
    throw new Error('GAGAL STEP 1: Tidak bisa mendapatkan cookie dari fc.yahoo.com maupun finance.yahoo.com. Yahoo mungkin memblokir request ini.');
  }

  const crumb = await fetchCrumb(cookie);

  cachedAuth = { cookie, crumb };
  cacheExpiry = now + 25 * 60 * 1000; // cache 25 menit (selama instance warm)
  return cachedAuth;
}

/**
 * Ambil floatShares & sharesOutstanding untuk satu ticker dari quoteSummary.
 * @param {string} ticker - contoh 'BBCA' (otomatis ditambah .JK)
 */
export async function getShareStatistics(ticker) {
  const symbol = ticker.toUpperCase().endsWith('.JK') ? ticker.toUpperCase() : `${ticker.toUpperCase()}.JK`;
  const auth = await getYahooAuth();

  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics&crumb=${encodeURIComponent(auth.crumb)}`;
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, 'Cookie': auth.cookie },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GAGAL STEP 3 (quoteSummary): HTTP ${res.status} — ${text.slice(0, 200)}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`GAGAL parse JSON: ${text.slice(0, 200)}`);
  }

  const stats = json?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
  if (!stats) {
    throw new Error(`Response tidak punya defaultKeyStatistics. Raw: ${JSON.stringify(json).slice(0, 300)}`);
  }

  return {
    symbol,
    floatShares: stats.floatShares?.raw ?? null,
    sharesOutstanding: stats.sharesOutstanding?.raw ?? null,
    freeFloatPct: (stats.floatShares?.raw && stats.sharesOutstanding?.raw)
      ? (stats.floatShares.raw / stats.sharesOutstanding.raw) * 100
      : null,
  };
}
