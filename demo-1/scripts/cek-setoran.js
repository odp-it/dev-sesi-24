// Cek bentuk data/setoran.json hasil ekstraksi data/catatan-setoran.txt (Bagian 2.2).
// Yang dicek: jumlah record = jumlah catatan, field wajib, nilai enum, format,
// dan aturan "tidak menebak" (record yang tidak lengkap wajib perlu_cek = true).
// Pakai: node scripts/cek-setoran.js [data/setoran.json]
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'data/setoran.json';
const catatan = readFileSync('data/catatan-setoran.txt', 'utf8')
  .split(/\r?\n/)
  .map((teks, i) => ({ baris: i + 1, teks: teks.trim() }))
  .filter((c) => c.teks && !c.teks.startsWith('#'));

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`GAGAL  ${file} tidak bisa dibaca sebagai JSON: ${err.message}`);
  process.exit(1);
}

const KATEGORI = ['PENJUALAN', 'LAINNYA'];
const FIELDS = ['baris', 'tanggal', 'nama', 'account_no', 'amount', 'kategori', 'perlu_cek', 'alasan_cek'];
const masalah = [];

if (!Array.isArray(data)) {
  console.error('GAGAL  isi file harus array JSON');
  process.exit(1);
}
if (data.length !== catatan.length) {
  masalah.push(`jumlah record ${data.length}, jumlah catatan ${catatan.length}`);
}

for (const r of data) {
  const id = `baris ${r.baris ?? '?'}`;
  for (const f of FIELDS) if (!(f in r)) masalah.push(`${id}: field "${f}" tidak ada`);
  if (!catatan.some((c) => c.baris === r.baris)) masalah.push(`${id}: tidak ada catatan di baris ini`);
  if (r.tanggal !== null && !/^2026-\d{2}-\d{2}$/.test(r.tanggal)) masalah.push(`${id}: tanggal "${r.tanggal}" bukan YYYY-MM-DD 2026`);
  if (r.account_no !== null && !/^SIM-\d{7}$/.test(r.account_no)) masalah.push(`${id}: account_no "${r.account_no}" bukan format SIM-1234567`);
  if (r.amount !== null && !(typeof r.amount === 'number' && r.amount > 0)) masalah.push(`${id}: amount harus angka > 0 atau null`);
  if (r.kategori !== null && !KATEGORI.includes(r.kategori)) masalah.push(`${id}: kategori "${r.kategori}" di luar ${KATEGORI.join('/')}`);
  if (typeof r.perlu_cek !== 'boolean') masalah.push(`${id}: perlu_cek harus true/false`);
  const lengkap = r.tanggal && r.account_no && r.amount;
  if (!lengkap && r.perlu_cek !== true) masalah.push(`${id}: ada field kosong tapi perlu_cek bukan true`);
  if (r.perlu_cek === true && !r.alasan_cek) masalah.push(`${id}: perlu_cek true tanpa alasan_cek`);
}

const siap = data.filter((r) => r.perlu_cek === false);
const cek = data.filter((r) => r.perlu_cek === true);
console.log(`Catatan: ${catatan.length} | Record: ${data.length} | Siap: ${siap.length} | Perlu cek: ${cek.length}`);
console.log(`Total siap disetor: Rp${siap.reduce((n, r) => n + (r.amount ?? 0), 0).toLocaleString('id-ID')}`);
for (const r of cek) console.log(`  perlu_cek baris ${r.baris}: ${r.alasan_cek}`);

if (masalah.length) {
  console.log(`\nGAGAL  ${masalah.length} masalah:`);
  for (const m of masalah) console.log(`  - ${m}`);
  process.exit(1);
}
console.log('\nOK  bentuk data sesuai aturan');
