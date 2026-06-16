// lib/yahoo-historical.js
// Helper bersama untuk mengambil harga close historis dari Yahoo Finance.
// Dipakai oleh api/historical-price.js (endpoint mandiri) dan api/top-marketcap.js
// (dipanggil langsung di server, tanpa nested HTTP request, agar lebih cepat & hemat invocation).

export async function getHistoricalClose(ticker, dateStr) {
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(targetDate.getTime())) {
    throw new Error('Invalid date format, gunakan YYYY-MM-DD');
  }

  const symbol = ticker.toUpperCase().endsWith('.JK')
    ? ticker.toUpperCase()
    : `${ticker.toUpperCase()}.JK`;

  // Range: dari target date - 10 hari (buffer weekend/libur bursa) sampai target date + 1 hari
  const period1 = Math.floor(targetDate.getTime() / 1000) - 10 * 24 * 60 * 60;
  const period2 = Math.floor(targetDate.getTime() / 1000) + 1 * 24 * 60 * 60;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${period1}&period2=${period2}`;
  const yRes = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
    }
  });

  if (!yRes.ok) throw new Error(`Yahoo Finance error: ${yRes.status}`);

  const data = await yRes.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error('Ticker tidak ditemukan di Yahoo Finance');

  const ts = result.timestamp || [];
  const q  = result.indicators?.quote?.[0] || {};

  if (ts.length === 0) {
    throw new Error('Tidak ada data perdagangan pada/sebelum tanggal tersebut');
  }

  // Cari candle terakhir dengan timestamp <= target date (end of day)
  // -> mengakomodasi weekend/libur bursa, hasilnya "as of last trading session"
  const targetEndOfDay = Math.floor(targetDate.getTime() / 1000) + 24 * 60 * 60 - 1;
  let bestIdx = -1;
  for (let i = 0; i < ts.length; i++) {
    if (ts[i] <= targetEndOfDay) bestIdx = i;
  }
  if (bestIdx === -1) bestIdx = 0; // fallback: candle paling awal yang tersedia

  const close = q.close?.[bestIdx];
  if (!close || close <= 0) {
    throw new Error('Data harga tidak valid (kemungkinan saham tidak diperdagangkan/suspend pada periode ini)');
  }

  return {
    symbol,
    requestedDate: dateStr,
    actualTradingDate: new Date(ts[bestIdx] * 1000).toISOString().slice(0, 10),
    price: Math.round(close),
  };
}
