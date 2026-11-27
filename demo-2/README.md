# Demo 2 · Prompt untuk Data Terstruktur & Tidak Terstruktur

[Persiapan](../README.md) · [Troubleshooting](../TROUBLESHOOTING.md)

> Hasil Demo 1 sudah terisi di folder ini. Buka folder ini langsung di VS Code dan lakukan persiapan project di sini (`.env`, install, atau `git init`).

Kerjakan 2.1-2.4: prompt untuk input terstruktur dan tidak terstruktur, lalu cek hasilnya di luar AI.

**Demo instruktur (±17 menit):** prompt umum dibanding prompt berstruktur, plan mode, prompt dengan input terstruktur (schema, kode, aturan saldo) dan input tidak terstruktur (catatan bebas), serta cara mengecek hasilnya di luar AI. **Ikuti (±28 menit):** langkah 2.1-2.4.

## 2.1 Seed SQL dari schema

1. Tempel isi `prompts/b1-seed-terstruktur.txt`. Navigator membaca isi file yang akan dibuat (`Do you want to create seed-tambahan.sql?`), lalu **1. Yes**. Kalau agent meminta izin menjalankan script cek buatannya sendiri, navigator membaca dulu perintahnya.
2. Reviewer membuka `db/seed-tambahan.sql` di VS Code dan **Attach Connection** ke `ALP_DEV @ FREEPDB1`. Belum dijalankan.
3. Salin seluruh isi `db/cek-seed-tambahan.sql` ke bawah isi seed di worksheet yang sama, lalu **Run Script (F5)** sekali. Seed dan cek harus satu worksheet: setiap tab adalah session sendiri dan Auto Commit mati, jadi tab lain belum melihat data seed (hasilnya `0 / 0 / 0`).
4. Batalkan data latihan supaya `ALP_DEV` tetap bersih untuk sesi berikutnya. Di worksheet yang sama jalankan:

```sql
ROLLBACK;
```

Yang harus terlihat di langkah 2: hanya `1 row inserted.` tanpa `ORA-`. Di langkah 3:

```text
DATA       JUMLAH
--------- -------
nasabah         5
rekening        6
transaksi      20
```

Semua baris rekonsiliasi `COCOK`, dan `TXN_REKENING_TIDAK_AKTIF` = `0`. Setelah `ROLLBACK`, `SELECT COUNT(*) FROM customers WHERE cif_no LIKE 'CIF-SIM-2%';` = `0`.

Kalau ada `ORA-` atau `SELISIH`: jalankan `ROLLBACK;`, salin pesan error (tanpa data lain) ke Claude Code dengan prompt "Perbaiki db/seed-tambahan.sql. Error dari Oracle: [PESAN ERROR]. Jangan ubah file lain.", lalu ulangi langkah 2-4. Catat iterasinya di log approval.

## 2.2 Catatan setoran bebas ke JSON

1. Buka `data/catatan-setoran.txt` dan baca sendiri dulu. Setiap anggota menandai baris yang menurutnya ragu (tanggal, rekening, atau nominal tidak jelas).
2. Tempel isi `prompts/b2-ekstrak-catatan.txt`. Setujui pembuatan `data/setoran.json` dan perintah `node scripts/cek-setoran.js`.
3. Reviewer menjalankan sendiri:

```bash
node scripts/cek-setoran.js
```

Yang harus terlihat (angka bergantung isi file):

```text
Catatan: 12 | Record: 12 | Siap: [N] | Perlu cek: [N]
Total siap disetor: Rp[TOTAL]
  perlu_cek baris [N]: [alasan]
...
OK  bentuk data sesuai aturan
```

4. Bandingkan daftar `perlu_cek` dengan tanda tim di langkah 1. Untuk setiap baris yang beda, putuskan siapa yang benar dan tulis alasannya di log approval (bagian Temuan). Baris yang tidak ditandai agent tapi menurut tim ragu: minta agent mengubah record itu menjadi `perlu_cek: true` dengan alasan dari tim.

## 2.3 Commit

```bash
git add db/seed-tambahan.sql data/setoran.json && git commit -m "feat: seed tambahan dan hasil ekstraksi setoran"
```

## 2.4 Cek silang ke database

Catatan setoran menyebut nama dan nomor rekening. Untuk setiap record yang `perlu_cek: false`, cocokkan pemilik rekening di Oracle:

```sql
SELECT a.account_no, c.full_name, a.status
  FROM accounts a
  JOIN customers c ON c.customer_id = a.customer_id
 WHERE a.account_no IN ('[ACCOUNT_NO_1]', '[ACCOUNT_NO_2]')
 ORDER BY a.account_no;
```

Nama tidak cocok atau status bukan `AKTIF`: ubah record itu menjadi `perlu_cek: true` (boleh lewat agent) dan catat di log.

Ganti peran untuk Demo 3.

## Tantangan tambahan Demo 2 (opsional)

1. Tambahkan satu transaksi `SETOR` ke rekening seed tambahan yang berstatus `DIBLOKIR` (`SIM-2000005`) di worksheet yang sama dengan seed (sebelum `ROLLBACK`), lalu jalankan lagi query nomor 3 di `db/cek-seed-tambahan.sql`. Apakah Oracle menolak `INSERT`-nya? Berapa nilai `txn_rekening_tidak_aktif` sekarang, dan kenapa aturan "rekening tidak aktif tidak boleh bertransaksi" perlu dijaga di kode (Demo 4), bukan hanya di constraint tabel? `ROLLBACK` lagi setelahnya.
2. Hitung sendiri total nominal record `perlu_cek: false` di `data/setoran.json` dengan satu perintah `node` (mis. `node -e "const r = JSON.parse(require('fs').readFileSync('data/setoran.json','utf8')); console.log(r.filter(x => !x.perlu_cek).reduce((t, x) => t + x.amount, 0))"`) dan cocokkan dengan baris `Total siap disetor` dari `cek-setoran.js`.
