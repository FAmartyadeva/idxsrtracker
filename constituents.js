// constituents.js
// Data statis: jumlah saham beredar (sharesOutstanding) & rasio free float (freeFloatPct)
// per emiten. Harga TIDAK disimpan di sini — selalu di-fetch live per tanggal dari /api/stock.
//
// SUMBER & TANGGAL DATA (update manual berkala, idealnya tiap ada rebalancing LQ45/IDX30 — Mei & November):
//   - Free float %: Databoks/Katadata, "Rasio Free Float Saham 45 Emiten dalam Indeks LQ45
//     Mei-Juli 2026", published 27/04/2026. https://databoks.katadata.co.id (data resmi BEI)
//   - Shares outstanding: StockAnalysis.com (stockanalysis.com/quote/idx/{TICKER}/statistics/),
//     diakses Juni 2026. Data ini sangat stabil & jarang berubah kecuali ada stock split,
//     rights issue, atau buyback besar.
//
// CATATAN PENTING:
//   - Free float % praktis tidak berubah harian — IDX & MSCI hanya merilis ulang di evaluasi
//     periodik (umumnya Mei & November). Maka untuk fitur "pilih tanggal", free float %
//     yang dipakai adalah nilai TERBARU/TETAP (sesuai keputusan produk), sementara HARGA
//     saham di-fetch historis sesuai tanggal yang dipilih user.
//   - sharesOutstanding dalam satuan LEMBAR SAHAM (bukan miliar/triliun).
//   - Untuk menambah/mengganti emiten, cukup edit array CONSTITUENTS di bawah.

const CONSTITUENTS = [
  // ticker, sharesOutstanding (lembar), freeFloatPct (0-100), sector (opsional, utk tampilan)
  { ticker: 'BBCA', sharesOutstanding: 122_880_000_000, freeFloatPct: 42.59, sector: 'Perbankan' },
  { ticker: 'BBRI', sharesOutstanding: 151_560_000_000, freeFloatPct: 46.28, sector: 'Perbankan' },
  { ticker: 'BMRI', sharesOutstanding: 93_333_333_333, freeFloatPct: 39.16, sector: 'Perbankan' },
  { ticker: 'BBNI', sharesOutstanding: 37_260_000_000, freeFloatPct: 38.92, sector: 'Perbankan' },
  { ticker: 'TLKM', sharesOutstanding: 99_060_000_000, freeFloatPct: 46.97, sector: 'Telekomunikasi' },
  { ticker: 'ASII', sharesOutstanding: 40_210_000_000, freeFloatPct: 43.92, sector: 'Otomotif/Konglomerasi' },
  { ticker: 'GOTO', sharesOutstanding: 1_190_000_000_000, freeFloatPct: 71.44, sector: 'Teknologi' },
  { ticker: 'AMMN', sharesOutstanding: 72_520_000_000, freeFloatPct: 18.99, sector: 'Pertambangan' },
  { ticker: 'ICBP', sharesOutstanding: 11_660_000_000, freeFloatPct: 19.47, sector: 'Konsumer' },
  { ticker: 'UNVR', sharesOutstanding: 37_980_000_000, freeFloatPct: 14.06, sector: 'Konsumer' },
  { ticker: 'KLBF', sharesOutstanding: 45_250_000_000, freeFloatPct: 38.31, sector: 'Farmasi' },
  { ticker: 'MDKA', sharesOutstanding: 24_420_000_000, freeFloatPct: 47.85, sector: 'Pertambangan' },
  { ticker: 'INDF', sharesOutstanding: 8_780_000_000, freeFloatPct: 48.24, sector: 'Konsumer' },
  { ticker: 'SMGR', sharesOutstanding: 5_931_000_000, freeFloatPct: 48.53, sector: 'Semen' },
  { ticker: 'CPIN', sharesOutstanding: 16_398_000_000, freeFloatPct: 34.14, sector: 'Pangan/Peternakan' },
  { ticker: 'AMRT', sharesOutstanding: 18_647_000_000, freeFloatPct: 41.03, sector: 'Ritel' },
  { ticker: 'ANTM', sharesOutstanding: 24_031_000_000, freeFloatPct: 34.84, sector: 'Pertambangan' },
  { ticker: 'UNTR', sharesOutstanding: 3_730_000_000, freeFloatPct: 34.96, sector: 'Alat Berat' },
  { ticker: 'EXCL', sharesOutstanding: 11_352_000_000, freeFloatPct: 30.57, sector: 'Telekomunikasi' },
  { ticker: 'PGAS', sharesOutstanding: 24_242_000_000, freeFloatPct: 43.03, sector: 'Energi' },
];

// Metadata sumber, ditampilkan di UI untuk transparansi ke pengguna
const DATA_SOURCE_INFO = {
  freeFloatSource: 'Databoks/Katadata — Rasio Free Float 45 Emiten LQ45 (periode 4 Mei–31 Jul 2026), data resmi BEI',
  freeFloatAsOf: '2026-04-27',
  sharesOutstandingSource: 'StockAnalysis.com (S&P Global Market Intelligence)',
  sharesOutstandingAsOf: '2026-06',
  note: 'Free float % menggunakan nilai terbaru/tetap (jarang berubah, hanya direvisi saat evaluasi mayor BEI tiap Mei & November). Harga saham di-fetch historis sesuai tanggal yang dipilih.',
};

export { CONSTITUENTS, DATA_SOURCE_INFO };
