// api/top-marketcap.js — Vercel Serverless Function
// Menghitung & mengurutkan emiten berdasarkan Free-Float Adjusted Market Capitalization
// pada tanggal tertentu (as of last trading session sebelum/pada tanggal yang dipilih).
//
// Formula (mengikuti metodologi indeks BEI IDX30/LQ45/IDX80):
//   MarketCap           = Price x SharesOutstanding
//   Free Float Shares   = SharesOutstanding x (FreeFloatPct / 100)
//   FF Adjusted MktCap  = Price x Free Float Shares
//                       = MarketCap x (FreeFloatPct / 100)
//
// Query params:
//   date  -> tanggal target format YYYY-MM-DD (default: hari ini)
//   limit -> jumlah top N yang dikembalikan (default 20)

import { CONSTITUENTS, DATA_SOURCE_INFO } from '../constituents.js';
import { getHistoricalClose } from '../lib/yahoo-historical.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const date  = req.query.date || new Date().toISOString().slice(0, 10);
  const limit = parseInt(req.query.limit) || 20;

  const targetDate = new Date(date + 'T00:00:00Z');
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format, gunakan YYYY-MM-DD' });
  }
  if (targetDate.getTime() > Date.now()) {
    return res.status(400).json({ error: 'Tanggal tidak boleh di masa depan' });
  }

  const results = [];
  const errors  = [];

  // Fetch harga semua konstituen secara paralel, langsung panggil helper (tanpa nested HTTP call)
  const settled = await Promise.all(
    CONSTITUENTS.map(async (c) => {
      try {
        const priceData = await getHistoricalClose(c.ticker, date);
        return { ...c, ...priceData, ok: true };
      } catch (err) {
        return { ticker: c.ticker, ok: false, error: err.message };
      }
    })
  );

  for (const item of settled) {
    if (!item.ok) {
      errors.push({ ticker: item.ticker, error: item.error });
      continue;
    }
    const marketCap        = item.price * item.sharesOutstanding;
    const freeFloatShares  = item.sharesOutstanding * (item.freeFloatPct / 100);
    const ffAdjustedMktCap = item.price * freeFloatShares;

    results.push({
      ticker: item.ticker,
      sector: item.sector,
      price: item.price,
      tradingDate: item.actualTradingDate,
      sharesOutstanding: item.sharesOutstanding,
      freeFloatPct: item.freeFloatPct,
      marketCap: Math.round(marketCap),
      freeFloatShares: Math.round(freeFloatShares),
      ffAdjustedMarketCap: Math.round(ffAdjustedMktCap),
    });
  }

  results.sort((a, b) => b.ffAdjustedMarketCap - a.ffAdjustedMarketCap);
  const top = results.slice(0, limit).map((r, idx) => ({ rank: idx + 1, ...r }));

  return res.status(200).json({
    requestedDate: date,
    asOfNote: 'Harga = harga close pada sesi perdagangan terakhir pada/sebelum tanggal yang diminta',
    totalConstituents: CONSTITUENTS.length,
    successCount: results.length,
    errors,
    dataSource: DATA_SOURCE_INFO,
    data: top,
  });
}
