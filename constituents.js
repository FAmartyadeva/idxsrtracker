// constituents.js
// Data statis: jumlah saham beredar (sharesOutstanding) & rasio free float (freeFloatPct)
// per emiten. Harga TIDAK disimpan di sini — selalu di-fetch live per tanggal dari /api/stock.
//
// ====================================================================================
// CATATAN METODOLOGI & KETERBATASAN (baca sebelum mengandalkan data ini)
// ====================================================================================
// Data ini DIKUMPULKAN MANUAL melalui riset web pada tanggal yang tercantum di setiap
// baris (field accessedDate). Tidak ada API otomatis/real-time yang tersedia gratis untuk
// data free float & shares outstanding khusus saham IDX (sudah diverifikasi: TradingView
// dan IDNFinancials render data via JavaScript sehingga tidak bisa di-fetch otomatis;
// Yahoo Finance quoteSummary butuh cookie+crumb yang terbukti diblokir [HTTP 429] saat
// diuji dari server Vercel; Financial Modeling Prep tidak mencakup IDX; Sectors.app
// mencakup IDX tapi API-nya berbayar).
//
// Konsekuensi: data berikut TIDAK real-time dan TIDAK update otomatis. Untuk evaluasi
// resmi BEI berikutnya (Mei/November), atau jika ada stock split/rights issue/buyback
// besar pada emiten tertentu, data ini HARUS diperbarui manual.
//
// freeFloatPct: bersumber dari Databoks/Katadata, artikel "Rasio Free Float Saham 45
//   Emiten dalam Indeks LQ45 Mei-Juli 2026" (data resmi BEI), published 27 April 2026,
//   diakses 16 Juni 2026.
//   URL: https://databoks.katadata.co.id/pasar/statistik/69eefb265b96b/rasio-free-float-saham-45-emiten-dalam-indeks-lq45-mei-juli-2026
//   Cross-check independen: angka ANTM (34.84%) dikonfirmasi cocok dengan IDNFinancials
//   (idnfinancials.com/antm/pt-aneka-tambang-tbk#free-float, dicek user 16 Juni 2026,
//   data per 30 April 2026).
//
// sharesOutstanding: bersumber dari StockAnalysis.com (stockanalysis.com/quote/idx/{TICKER}/
//   statistics/), via S&P Global Market Intelligence. TANGGAL AKSES BERBEDA PER SAHAM —
//   lihat field accessedDate di setiap baris (mayoritas Juni 2026, beberapa diverifikasi
//   ulang dari sumber sekunder bertanggal lebih lama — lihat catatan per baris).
//
// sectorAccessedDate: -
// ====================================================================================

const CONSTITUENTS = [
  {
    ticker: 'BBCA', sector: 'Perbankan',
    sharesOutstanding: 122_880_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 42.59,
  },
  {
    ticker: 'BBRI', sector: 'Perbankan',
    sharesOutstanding: 151_560_000_000,
    sharesSource: 'Artikel mediaperbankan.com (mengutip data BEI, stock split 1:5 tahun 2017)', sharesAccessedDate: '2025-08-11',
    freeFloatPct: 46.28,
  },
  {
    ticker: 'BMRI', sector: 'Perbankan',
    sharesOutstanding: 93_333_333_333,
    sharesSource: 'Artikel mediaperbankan.com (mengutip data KSEI per Nov 2025, pasca stock split 1:2 tahun 2023)', sharesAccessedDate: '2025-11-07',
    freeFloatPct: 39.16,
  },
  {
    ticker: 'BBNI', sector: 'Perbankan',
    sharesOutstanding: 37_260_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 38.92,
  },
  {
    ticker: 'TLKM', sector: 'Telekomunikasi',
    sharesOutstanding: 99_060_000_000,
    sharesSource: 'StockAnalysis.com / TradingEconomics (cross-check, keduanya menunjukkan angka sama)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 46.97,
  },
  {
    ticker: 'ASII', sector: 'Otomotif/Konglomerasi',
    sharesOutstanding: 40_210_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 43.92,
  },
  {
    ticker: 'GOTO', sector: 'Teknologi',
    sharesOutstanding: 1_190_000_000_000,
    sharesSource: 'Artikel market.bisnis.com (mengutip data KSEI per 27 April 2025)', sharesAccessedDate: '2025-04-27',
    freeFloatPct: 71.44,
  },
  {
    ticker: 'AMMN', sector: 'Pertambangan',
    sharesOutstanding: 72_520_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 18.99,
  },
  {
    ticker: 'ICBP', sector: 'Konsumer',
    sharesOutstanding: 11_660_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 19.47,
  },
  {
    ticker: 'UNVR', sector: 'Konsumer',
    sharesOutstanding: 37_980_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 14.06,
  },
  {
    ticker: 'KLBF', sector: 'Farmasi',
    sharesOutstanding: 45_250_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 38.31,
  },
  {
    ticker: 'MDKA', sector: 'Pertambangan',
    sharesOutstanding: 24_420_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 47.85,
  },
  {
    ticker: 'INDF', sector: 'Konsumer',
    sharesOutstanding: 8_780_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 48.24,
  },
  {
    ticker: 'SMGR', sector: 'Semen',
    sharesOutstanding: 5_931_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 48.53,
  },
  {
    ticker: 'CPIN', sector: 'Pangan/Peternakan',
    sharesOutstanding: 16_398_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 34.14,
  },
  {
    ticker: 'AMRT', sector: 'Ritel',
    sharesOutstanding: 18_647_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 41.03,
  },
  {
    ticker: 'ANTM', sector: 'Pertambangan',
    sharesOutstanding: 24_031_000_000,
    sharesSource: 'StockAnalysis.com', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 34.84, // Cross-check: cocok dengan IDNFinancials (34.84%, data per 30 Apr 2026), dicek user via screenshot 16 Jun 2026
  },
  {
    ticker: 'UNTR', sector: 'Alat Berat',
    sharesOutstanding: 3_730_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 34.96,
  },
  {
    ticker: 'EXCL', sector: 'Telekomunikasi',
    sharesOutstanding: 11_352_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — CATATAN: EXCL sedang proses merger dengan FREN/Smartfren per pertengahan 2026, shares outstanding berisiko TIDAK akurat/berubah signifikan)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 30.57,
  },
  {
    ticker: 'PGAS', sector: 'Energi',
    sharesOutstanding: 24_242_000_000,
    sharesSource: 'StockAnalysis.com (TIDAK diverifikasi ulang dengan sumber kedua — prioritas re-cek jika dipakai untuk keperluan formal)', sharesAccessedDate: '2026-06-16',
    freeFloatPct: 43.03,
  },
];

// Metadata sumber free float (sama untuk semua saham — datanya satu artikel/rilis BEI)
const DATA_SOURCE_INFO = {
  freeFloatSource: 'Databoks/Katadata — "Rasio Free Float Saham 45 Emiten dalam Indeks LQ45 Mei-Juli 2026" (data resmi BEI)',
  freeFloatSourceUrl: 'https://databoks.katadata.co.id/pasar/statistik/69eefb265b96b/rasio-free-float-saham-45-emiten-dalam-indeks-lq45-mei-juli-2026',
  freeFloatPublishedDate: '2026-04-27',
  freeFloatAccessedDate: '2026-06-16',
  freeFloatCrossCheck: 'ANTM (34.84%) dikonfirmasi cocok dengan IDNFinancials (data per 30 April 2026)',
  sharesOutstandingNote: 'Sumber & tanggal akses BERBEDA per saham — lihat field sharesSource & sharesAccessedDate pada setiap entri di atas.',
  generalCaveat: 'Data ini DIKUMPULKAN MANUAL, BUKAN dari API otomatis/real-time (sudah diuji: opsi otomatis gratis untuk data ini tidak tersedia/tidak reliable untuk saham IDX). Free float % praktis stabil (direvisi BEI hanya ~2x/tahun, Mei & November), tapi shares outstanding bisa berubah sewaktu-waktu jika ada stock split, rights issue, buyback, atau (untuk EXCL) merger korporasi. WAJIB diperbarui manual secara berkala, dan WAJIB di-cross-check ulang sebelum dipakai untuk keperluan formal/akademik/publikasi.',
};

export { CONSTITUENTS, DATA_SOURCE_INFO };
