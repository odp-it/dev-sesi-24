# Demo 4 · Fitur dengan Test

[Persiapan](../README.md) · [Troubleshooting](../TROUBLESHOOTING.md)

> Hasil Demo 1 sampai Demo 3 sudah terisi di folder ini. Buka folder ini langsung di VS Code dan lakukan persiapan project di sini (`.env`, install, atau `git init`).

Di kelas, Demo 4 diperagakan instruktur (±10 menit) karena waktu kelas dipakai untuk presentasi project. Kerjakan 4.1-4.2 secara mandiri setelah kelas: tambah aturan validasi dengan test dulu, review diff, lalu commit. Commit 4.1 dipakai di latihan mandiri folder `lab`.

## 4.1 Aturan validasi baru, test dulu

Mode kembali `manual mode on` setelah rencana 3.1 dijalankan. Tempel isi `prompts/c2-aturan-validasi.txt`. Setujui edit test dulu, lalu edit `src/validator.js`.

Yang harus terlihat di jawaban agent: test baru gagal dulu, lalu semua lulus. Reviewer menjalankan `npm test` sendiri dan mengecek:

- Test lama (6 test validator) tidak berubah: `git diff test/validator.test.js` hanya berisi baris `+`.
- Ada test untuk `ACCOUNT_BLOCKED`, `ACCOUNT_CLOSED`, dan `VALIDATION_ERROR` (0, minus, bukan number, lebih dari 2 desimal).

## 4.2 Commit dan log

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
