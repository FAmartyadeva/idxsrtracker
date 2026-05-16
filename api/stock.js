// api/stock.js — Vercel Serverless Function
// Fetches IDX stock data from Yahoo Finance (free, no API key needed)
// Ticker format: IRSX.JK, BULL.JK (Yahoo Finance IDX format)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker param' });

  const symbol = ticker.toUpperCase().endsWith('.JK')
    ? ticker.toUpperCase()
    : `${ticker.toUpperCase()}.JK`;

  try {
    // ── 1. Fetch quote (current price, change, 52w high/low) ──
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const quoteRes = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!quoteRes.ok) {
      throw new Error(`Yahoo Finance error: ${quoteRes.status}`);
    }

    const quoteData = await quoteRes.json();
    const meta = quoteData?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('Ticker tidak ditemukan di Yahoo Finance');

    const price      = Math.round(meta.regularMarketPrice || 0);
    const prevClose  = Math.round(meta.chartPreviousClose || meta.previousClose || price);
    const change     = price - prevClose;
    const changePct  = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;
    const high52w    = Math.round(meta.fiftyTwoWeekHigh || 0);
    const low52w     = Math.round(meta.fiftyTwoWeekLow  || 0);
    const volume     = formatVolume(meta.regularMarketVolume || 0);

    // ── 2. Fetch OHLC history (60 days) for S/R calculation ──
    const histUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`;
    const histRes = await fetch(histUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    let ohlc = [];
    if (histRes.ok) {
      const histData = await histRes.json();
      const result   = histData?.chart?.result?.[0];
      const ts       = result?.timestamp || [];
      const q        = result?.indicators?.quote?.[0] || {};

      ohlc = ts.map((t, i) => ({
        date:  new Date(t * 1000).toISOString().slice(0, 10),
        open:  Math.round(q.open?.[i]  || 0),
        high:  Math.round(q.high?.[i]  || 0),
        low:   Math.round(q.low?.[i]   || 0),
        close: Math.round(q.close?.[i] || 0),
        volume: q.volume?.[i] || 0,
      })).filter(c => c.open > 0 && c.high > 0 && c.low > 0 && c.close > 0);
    }

    return res.status(200).json({ price, change, changePct, high52w, low52w, volume, ohlc, symbol });

  } catch (err) {
    console.error(`[stock.js] ${symbol}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
}

function formatVolume(v) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)         return (v / 1_000).toFixed(1) + 'K';
  return String(v);
}
