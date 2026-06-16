// api/test-yahoo-crumb.js — Vercel Serverless Function
// ENDPOINT KHUSUS DEBUG/TES — bukan untuk produksi.
// Tujuan: cek apakah cookie+crumb Yahoo Finance benar-benar bisa jalan dari server Vercel
// (sandbox riset tidak bisa dipakai untuk tes ini karena network egress-nya dimatikan).
//
// Cara pakai: buka https://domain-anda.vercel.app/api/test-yahoo-crumb?ticker=BBCA
// Lihat response JSON-nya — kalau "success": true berarti cookie+crumb BERHASIL dan kita
// bisa lanjut pakai floatShares/sharesOutstanding asli dari Yahoo Finance.
// Kalau "success": false, baca "step" dan "error" untuk tahu di mana gagalnya.

import { getShareStatistics } from '../lib/yahoo-crumb-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const ticker = req.query.ticker || 'BBCA';

  try {
    const result = await getShareStatistics(ticker);
    return res.status(200).json({
      success: true,
      message: 'Cookie+crumb BERHASIL. Data di bawah ini asli dari Yahoo Finance quoteSummary.',
      data: result,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: 'Cookie+crumb GAGAL pada tahap tertentu. Lihat detail error di bawah.',
      error: err.message,
    });
  }
}
