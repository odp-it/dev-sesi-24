# Demo 4 · Fitur dengan Test (±25 menit)

> Folder ini project lengkap. Hasil Demo 1 sampai Demo 3 **sudah terisi** (catch-up). Kalau pekerjaanmu sendiri sudah jalan, boleh pakai punyamu.
> Buka folder ini langsung di VS Code, lalu lakukan persiapan di [README utama](../README.md) (mis. salin `.env`, install, atau `git init`) **di folder ini**. Semua path relatif terhadap folder ini.

**Peraga (±5 menit):** alur test dulu, rencana, edit dengan izin, `npm test`, review diff, commit oleh tim. **Ikuti (±20 menit):** langkah 4.1–4.2.

## 4.1 Aturan validasi baru, test dulu (±15 menit)

Mode kembali `manual mode on` setelah rencana 3.1 dijalankan. Tempel isi `prompts/c2-aturan-validasi.txt`. Setujui edit test dulu, lalu edit `src/validator.js`.

Yang harus terlihat di jawaban agent: test baru gagal dulu, lalu semua lulus. Reviewer menjalankan `npm test` sendiri dan mengecek:

- Test lama (6 test validator) tidak berubah: `git diff test/validator.test.js` hanya berisi baris `+`.
- Ada test untuk `ACCOUNT_BLOCKED`, `ACCOUNT_CLOSED`, dan `VALIDATION_ERROR` (0, minus, bukan number, lebih dari 2 desimal).

## 4.2 Commit dan log (±5 menit)

1. Reviewer mengisi bagian **Lingkup** dan **Benar** di `review/checklist-review.md` untuk diff `src/validator.js` dan `test/validator.test.js`. Kalau waktu cukup, jalankan lagi prompt `prompts/c3-review-keamanan.txt`: kali ini diff yang belum di-commit ikut diulas.
2. Commit oleh tim, lalu cek riwayat dan log:

```bash
git add src/validator.js test/validator.test.js && git commit -m "feat(validator): tolak rekening tidak aktif dan nominal tidak valid"
git log --oneline
```

3. Security checker menyelesaikan `review/log-approval.md` (minimal 6 baris, tabel Temuan keamanan terisi kalau ada).

Keluar dari Claude Code dengan `/exit`.

## Tantangan tambahan Demo 4 (opsional)

Tulis sendiri prompt CONTEXT / TASK / RULES / OUTPUT FORMAT-nya (tiru `prompts/c2-aturan-validasi.txt`), test dulu, hanya `src/validator.js` dan `test/validator.test.js` yang boleh berubah.

1. Batas nominal: transaksi di atas Rp500.000.000 ditolak dengan `{ field: 'amount', code: 'AMOUNT_LIMIT_EXCEEDED' }`; tepat Rp500.000.000 masih valid. Nominal yang sudah ditolak `VALIDATION_ERROR` tidak ikut dicek batas.
2. Kategori `TRANSFER` hanya boleh dipakai bersama jenis `TRANSFER_MASUK` atau `TRANSFER_KELUAR`, dan jenis `TRANSFER_*` hanya dengan kategori `TRANSFER`: pelanggaran memberi `{ field: 'category', code: 'CATEGORY_MISMATCH' }`. Kategori di luar daftar tetap hanya `INVALID_CATEGORY`. Cek dulu dengan query di Oracle bahwa data sesi 22 memang tidak melanggar aturan ini.
