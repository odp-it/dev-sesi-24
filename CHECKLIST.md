# Checklist

[Kembali ke README](README.md)

## Kriteria Selesai

Di kelas:

- [ ] Status bar menampilkan `manual mode on` saat Claude Code dibuka di folder lab
- [ ] `CLAUDE.md` punya bagian "Aturan Tim" dan ter-commit
- [ ] `db/cek-seed-tambahan.sql`: 5 / 6 / 20, semua `COCOK`, `0` transaksi di rekening tidak aktif, lalu `ROLLBACK`
- [ ] `node scripts/cek-setoran.js` berakhir dengan `OK  bentuk data sesuai aturan`, dan setiap beda dengan tanda tim sudah diputuskan
- [ ] 3.1: `npm test` lulus, test lebih banyak dari 10, dan input berbahaya hanya ada di `binds`
- [ ] `review/log-approval.md` terisi minimal 4 baris dari Demo 1–3
- [ ] Presentasi project kelompok selesai dalam 5 menit, checklist sebelum presentasi terpenuhi
- [ ] Repo kelompok di-push dan link dikumpulkan sebelum 23.59

Latihan mandiri di luar kelas (tidak dinilai):

- [ ] Demo 4 (4.1–4.2): `git log --oneline` berisi commit awal + Demo 1, 2, 3 (3.1), dan 4 (4.1); `npm test` lulus
- [ ] Lab mandiri: `node challenge/cek-lab.mjs` menampilkan skor otomatis (target minimal 48 dari 80, setara 60%)

## Verifikasi & Expected Result

| Cek | Expected result |
| --- | --- |
| Claude Code dibuka di folder lab | `⏸ manual mode on` |
| Agent diminta membaca `.env` | Ditolak: `File is in a directory that is denied by your permission settings.` atau `permission denied · rule from shared project settings` |
| `db/cek-seed-tambahan.sql` setelah seed | `5`, `6`, `20`; semua `COCOK`; `0` |
| `node scripts/cek-setoran.js` | `Catatan: 12 | Record: 12`, minimal satu baris `perlu_cek`, akhir `OK  bentuk data sesuai aturan` |
| `npm test` setelah 3.1 (dan 4.1 bila dikerjakan mandiri) | `fail 0`, jumlah `tests` lebih dari 10 |
| `node scripts/cetak-query.js mutasi "SIM-1000001' OR '1'='1" 2026-03` setelah 3.1 | SQL memakai `:account_no`, input hanya ada di `binds` |
| `git log --oneline` di akhir kelas | 4 commit: commit awal + 1.6 + 2.3 + 3.1; 5 commit setelah 4.1 mandiri |
| `node challenge/cek-lab.mjs` sebelum latihan mandiri dikerjakan | `Subtotal otomatis 0 / 80` |
| `node challenge/cek-lab.mjs` setelah latihan mandiri | Tabel 7 kriteria dan `Subtotal otomatis [N] / 80`; test dan commit Lab berbeda tiap tim |
| Presentasi kelompok | `00-run-all.sql` jalan tanpa error, satu input salah ditolak dengan kode ORA, `<awalan>_LAP_RINGKASAN` tampil, rubrik project 100 poin |

Jawaban agent (kalimat, urutan, nama test) berbeda tiap tim dan tiap run. Yang dinilai adalah hasil cek di atas, bukan kemiripan teks.
