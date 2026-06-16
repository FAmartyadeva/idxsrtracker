// api/historical-price.js — Vercel Serverless Function
// Endpoint mandiri untuk mengambil harga close pada/sebelum tanggal tertentu (as of last
// trading session). Berguna untuk debugging per-ticker atau dipakai fitur lain di luar
// top-marketcap. Logic inti ada di lib/yahoo-historical.js (shared, dipakai juga oleh
// api/top-marketcap.js secara langsung tanpa nested HTTP call).
//
// Query params:
//   ticker  -> kode saham IDX, contoh BBCA (otomatis ditambah .JK)
//   date    -> tanggal target format YYYY-MM-DD

import { getHistoricalClose } from '../lib/yahoo-historical.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { ticker, date } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker param' });
  if (!date)   return res.status(400).json({ error: 'Missing date param (format YYYY-MM-DD)' });

  try {
    const result = await getHistoricalClose(ticker, date);
    return res.status(200).json(result);
  } catch (err) {
    console.error(`[historical-price.js] ${ticker}:`, err.message);
    return res.status(500).json({ error: err.message, ticker });
  }
}
