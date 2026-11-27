# Lab · Latihan Mandiri di Luar Kelas: Fitur ALP Kelompok dengan Test (tidak dinilai)

[Persiapan](../README.md) · [Troubleshooting](../TROUBLESHOOTING.md)

> Hasil Demo 1 sampai Demo 3 sudah terisi di folder ini. Buka folder ini langsung di VS Code dan lakukan persiapan project di sini (`.env`, install, atau `git init`).

Bagian ini **tidak dikerjakan dan tidak dinilai di kelas**. Waktu kelas dipakai untuk presentasi project. Kerjakan setelah kelas (setelah Demo 4 mandiri 4.1–4.2), cek sendiri dengan `node challenge/cek-lab.mjs`. Rubrik di bawah dipakai sebagai daftar cek, bukan nilai.

**Skenario.** Tech lead meminta tiap kelompok menambah satu aturan bisnis ke aplikasi ALP kelompok (mis. batas transfer harian di tema perbankan/UMKM, kuota voucher di e-commerce, kapasitas muatan di logistik). Syaratnya: aturan dikerjakan dengan test dulu, boleh dibantu agent, dan jejak keputusannya bisa diperiksa dari riwayat Git dan log approval. Hasil dicek sendiri dengan rubrik di bawah.

Satu laptop per kelompok, di repo yang sama dengan Demo 1–4. Fitur berbentuk satu fungsi tanpa database dan tanpa dependency, dengan hasil `{ valid, errors: [{ field, code }] }` seperti `validateTransaction`. Semua data simulasi. Kelompok tanpa akun Claude boleh menulis kode sendiri; baris log approval berisi keputusan reviewer atas setiap perubahan.

## L.1 Tulis spesifikasi dan kasus penerimaan

Isi `challenge/lab.json`:

| Isian | Aturan |
| --- | --- |
| `tim`, `fitur`, `fungsi` | Nama kelompok, nama fitur singkat, nama fungsi (mis. `cekBatasHarian`) |
| `modul` | `src/alp/<nama>.js` |
| `test` | `test/alp-<nama>.test.js` |
| `prompt` | Tetap `prompts/lab-alp.txt` |
| `kasus` | Minimal 5 kasus: minimal 1 `valid: true` dan minimal 3 kode error berbeda. `args` = daftar argumen fungsi, `hasil` = nilai return persis. Sertakan nilai tepat di batas |

Kasus penerimaan ditulis tim sebelum ada kode, supaya agent tidak menentukan sendiri arti "benar".

## L.2 Tulis prompt

```bash
cp challenge/template-prompt.txt prompts/lab-alp.txt
```

```powershell
Copy-Item challenge/template-prompt.txt prompts/lab-alp.txt
```

Ganti semua `ISI_...`. Path modul dan path test ditulis persis seperti di `lab.json`. `RULES` memuat batas dan kode error yang bisa dicek reviewer.

## L.3 Test dulu, lalu commit

Di `manual mode on`, tempel isi `prompts/lab-alp.txt`. Agent menulis test, menjalankan `npm test`, lalu berhenti. Reviewer mencocokkan test dengan kasus di `lab.json`, menjalankan `npm test` sendiri (test baru harus gagal), lalu tim commit:

```bash
git add test/alp-<nama>.test.js challenge/lab.json prompts/lab-alp.txt
git commit -m "test(alp): kasus penerimaan <nama fitur>"
```

File modul tidak boleh ikut commit ini. Tanpa agent: salin `challenge/template-uji.js` ke path `test` di `lab.json`.

## L.4 Implementasi, review diff, commit

Ketik `lanjut` di Claude Code. Setujui edit setelah membaca diff-nya (tanpa agent: salin `challenge/template-modul.js` ke path `modul`; folder dibuat dengan `mkdir -p src/alp`, di PowerShell `New-Item -ItemType Directory -Force src/alp`). Reviewer menjalankan `npm test`, mengisi `review/checklist-review.md` untuk fitur ini, lalu tim commit:

```bash
git add src/alp/<nama>.js
git commit -m "feat(alp): <nama fitur>"
```

Kalau test ikut berubah, commit juga perubahannya setelah reviewer membaca diff-nya.

## L.5 Log dan cek otomatis

Security checker mengisi minimal 3 baris berbagian `Lab` di `review/log-approval.md`: semua kolom terisi, kolom Keputusan diawali `Yes` atau `No`. Lalu dari folder lab:

```bash
node challenge/cek-lab.mjs
```

Perintahnya sama di macOS, Linux, dan Windows PowerShell. Skrip membaca file dan riwayat Git tim tanpa mengubahnya; uji "test menangkap fungsi salah" berjalan di salinan sementara. Perbaiki bagian yang disebut di "Yang perlu diperbaiki", lalu jalankan lagi.

## Rubrik latihan mandiri (100 poin, tidak dinilai)

| Kriteria | Poin | Dinilai oleh | Indikator keberhasilan |
| --- | --- | --- | --- |
| 1. Prompt tim berstruktur | 10 | `cek-lab.mjs` | Empat bagian terisi tanpa `ISI_`, path modul dan test disebut |
| 2. Test tim lulus | 15 | `cek-lab.mjs` | File test tim lulus, minimal 5 test |
| 3. Kasus penerimaan cocok | 20 | `cek-lab.mjs` | Minimal 5 kasus (1 valid, 3 kode error), hasil fungsi sama persis |
| 4. Test menangkap fungsi salah | 10 | `cek-lab.mjs` | Test gagal saat fungsi diganti versi "selalu valid" dan "selalu ditolak" |
| 5. Test dulu di riwayat Git | 10 | `cek-lab.mjs` | Commit test dibuat sebelum file modul ada; modul dan test sudah di-commit |
| 6. Log approval Lab | 10 | `cek-lab.mjs` | Minimal 3 baris `Lab` lengkap |
| 7. Aman | 5 | `cek-lab.mjs` | `.env` tidak dilacak Git, tanpa dependency baru, tanpa pola kredensial |
| Review diff | 10 | Review tim lain | Checklist terisi untuk fitur Lab, hanya file yang diminta yang berubah, reviewer bisa menjelaskan kodenya dalam 1 menit |
| Aturan bisnis | 5 | Review tim lain | Aturan cocok dengan tema ALP kelompok dan kasus menguji nilai di batas |
| Prompt dan data simulasi | 5 | Review tim lain | `RULES` bisa dicek, semua data di kasus dan test data simulasi |
| **Total** | **100** | 80 otomatis + 20 manual | |

Kalau waktu terbatas, dahulukan kriteria 2–5 (55 poin). Skor kurang dari 60: lanjutkan sampai memenuhi rubrik. Latihan ini tidak dikumpulkan dan tidak masuk nilai project; cek sendiri dengan `cek-lab.mjs` dan daftar rubrik di atas.

## Bonus Lab (opsional, maks. +10, cek sendiri)

1. (+5) Input tidak terstruktur untuk ALP kelompok: tulis minimal 5 baris catatan bebas simulasi sesuai tema kelompok, lalu buat prompt yang mengubahnya menjadi `data/alp-<nama>.json` dengan aturan jangan menebak, `perlu_cek`, dan `alasan_cek` (pola `prompts/b2-ekstrak-catatan.txt`). Tim mencocokkan setiap record dengan tandanya sendiri.
2. (+5) Sebelum commit `feat(alp)` (atau pada perubahan perbaikan sesudahnya), jalankan `prompts/c3-review-keamanan.txt`. Buktikan atau bantah minimal satu temuan di kode, lalu catat di tabel "Temuan keamanan".
