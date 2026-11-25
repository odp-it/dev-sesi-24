# 24 - Claude Code & Responsible AI-assisted Coding

Lab ini memakai Claude Code di repo kecil Tabungan UMKM untuk tiga pekerjaan: mengenali code base, membuat data dari input terstruktur dan tidak terstruktur, lalu memperbaiki kode yang tidak aman dengan test. Semua dikerjakan per tim dengan peran bergilir, dan setiap hasil AI dicek dengan alat yang tidak bergantung pada AI: Oracle, skrip cek, dan `npm test`. Hasil akhirnya: `CLAUDE.md` berisi aturan tim, seed tambahan yang lolos constraint, hasil ekstraksi catatan setoran, perbaikan SQL injection dan aturan validasi dengan test lulus, plus log approval.

## Tujuan

1. Menjalankan Claude Code di repo tim dengan permission mode manual dan `CLAUDE.md` berisi aturan tim.
2. Menulis prompt berstruktur CONTEXT / TASK / RULES / OUTPUT FORMAT untuk kode dan untuk input data terstruktur maupun tidak terstruktur.
3. Mengecek hasil AI dengan alat yang tidak bergantung pada AI: constraint dan rekonsiliasi di Oracle, skrip cek, dan `npm test`.
4. Mengenali hallucination, prompt injection, dan insecure code, lalu membatasinya dengan deny rule, approval, dan review.
5. Menjalankan alur generate, review, test, commit dengan peran tim bergilir.

## Estimasi Waktu

Format sesi: **4 Demo + 1 Lab**. Di tiap Demo instruktur memperagakan, lalu peserta mengikuti langkah bernomor yang sama dari file di folder lab ini (starter: kode yang sengaja belum aman atau belum lengkap, prompt siap tempel, template log). Demo 1 dan 2 inti sesi (mengenal repo dan prompt untuk data terstruktur serta tidak terstruktur): wajib selesai. Demo 3 (perbaikan keamanan) penting. Demo 4 (fitur dengan test) penerapan. **Lab** adalah tugas tim yang menerapkan semuanya pada satu fitur ALP, dinilai dengan rubrik 100 poin dan cek otomatis. Tiap Demo punya **Tantangan tambahan** untuk yang selesai lebih cepat (tidak wajib).

| Bagian | Durasi di kelas (peraga + ikuti) |
| --- | --- |
| Demo 1 · Setup & kenali code base | ±40 menit (20 + 20) |
| Demo 2 · Prompt untuk data terstruktur & tidak terstruktur | ±45 menit (17 + 28) |
| Demo 3 · Perbaikan keamanan | ±50 menit (25 + 25, coffee break di antaranya) |
| Demo 4 · Fitur dengan test | ±25 menit (5 + 20) |
| **Lab** · Fitur ALP tim dengan test (lanjut setelah kelas) | ±35 menit |
| **Total** | **±195 menit** (+ pembuka dan penutup = 210) |

## Environment & Tools

Disiapkan sebelum kelas lewat pengumuman persiapan. Versi dikunci: jangan update tool selama kelas. Dicek 22 Nov 2026 (channel stable saat itu: 2.1.323), 24 Nov 2026 (stable 2.1.325, latest 2.1.331), dan 25 Nov 2026 (stable 2.1.326). Channel stable bergerak: versi yang terpasang bisa lebih baru dari 2.1.330 dan tampilannya boleh sedikit berbeda dari tangkapan di materi.

| Tool | Versi | Catatan |
| --- | --- | --- |
| Claude Code | Channel `stable` (diuji dengan 2.1.330) | Native installer, tidak perlu admin. Login dengan akun yang disiapkan untuk tim |
| Akun Claude | Sesuai yang disiapkan penyelenggara | Akun milik satu orang hanya dipakai pemiliknya, di laptopnya sendiri. Lihat **Peran Tim** |
| Node.js | 26 LTS (fallback 24 LTS) | Tidak perlu `npm install`: lab ini tanpa dependency |
| Git | 2.x | Sudah dipakai sejak sesi sebelumnya |
| VS Code + **Oracle SQL Developer for VS Code** | 26.3.x | Koneksi `ALP_DEV @ FREEPDB1` dari sesi 21 |
| Oracle Database Free (container `oracle-alp`) | `23.26.4.0-lite` | Schema `ALP_DEV` dengan tabel dan data sesi 22 |

Pasang Claude Code channel stable (sekali, sebelum kelas):

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash -s stable
```

```powershell
# Windows PowerShell
& ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable
```

Ukuran unduhan Claude Code ±370 MB (di Windows `claude.exe` 372 MB, ±2,5 menit di jaringan cepat). Di jaringan berkuota, pasang sebelum kelas. Installer Windows memasang ke `%USERPROFILE%\.local\bin` dan bisa menulis `.local\bin is not in your PATH`: tutup dan buka terminal baru; bila `claude` masih `not recognized`, tambahkan `%USERPROFILE%\.local\bin` ke PATH user (Environment Variables), lalu buka terminal baru.

Di Windows, Git for Windows disarankan supaya Claude Code bisa memakai Git Bash. Tanpa Git for Windows, Claude Code menjalankan perintah lewat PowerShell.

### Cek kesiapan

| Item | Cara cek | Harus terlihat |
| --- | --- | --- |
| Claude Code | `claude --version` | `2.1.xxx (Claude Code)` |
| Login | `claude`, lalu `/status`, keluar dengan `/exit` | Nama akun dan plan, tanpa pesan `Not logged in` |
| Node.js | `node --version` | `v26.x` (atau `v24.x`) |
| Oracle | `docker ps` | `oracle-alp` dengan status `Up ... (healthy)`. Kalau mati: buka Docker Desktop, `docker start oracle-alp`, tunggu `(healthy)` |
| Data sesi 22 | Di SQL Developer, koneksi `ALP_DEV @ FREEPDB1`: `SELECT COUNT(*) FROM branches;` | `3` |

Data bulk sesi 23 masih ada (`SELECT COUNT(*) FROM transactions;` lebih dari `200000`)? Jalankan `03b-hapus-bulk.sql` dari folder lab sesi 23 dulu. Rekening uji bulk `SIM-2000001`–`SIM-2000500` memakai rentang yang sama dengan 2.1 dan membuat `ORA-00001`.

Belum punya tabel sesi 22 di `ALP_DEV`? Jalankan `db/catchup/01-schema.sql` lalu `db/catchup/02-seed.sql` dengan **Run Script (F5)**. Isinya sama dengan file lab sesi 22. Hasil akhir `02-seed.sql`: `3` cabang, `12` nasabah, `15` rekening, `125` transaksi, total saldo `218000000`.

## Demo & Lab

### Target

| Bagian | Hasil |
| --- | --- |
| Demo 1 | `CLAUDE.md` dari `/init` + bagian "Aturan Tim", ter-commit |
| Demo 2 | `db/seed-tambahan.sql` lolos constraint dan rekonsiliasi di Oracle; `data/setoran.json` lolos `node scripts/cek-setoran.js` |
| Demo 3 | `src/report-query.js` memakai bind variable; `npm test` lulus; review keamanan dicatat; commit 3.1 |
| Demo 4 | `src/validator.js` menolak rekening tidak aktif dan nominal tidak valid; `npm test` lulus; commit 4.1 |
| Lab | Satu fitur ALP tim dengan test: commit test lalu commit fitur, `node challenge/cek-lab.mjs` menampilkan skor |
| Semua | `review/log-approval.md` terisi |

### Studi Kasus

Tim melanjutkan aplikasi contoh **Tabungan UMKM** untuk bank fiktif. Code base ini menyiapkan validasi transaksi dan query laporan yang nanti dipakai REST API di sesi 29–33. Tim operasional juga mengirim dua bahan: kebutuhan data contoh tambahan untuk uji laporan, dan catatan setoran petugas lapangan yang ditulis bebas di chat. Semua data di lab ini data simulasi: rekening `SIM-`, CIF `CIF-SIM-`, email `@example.com`. Data nasabah asli, kredensial, dan kode internal tidak boleh masuk ke prompt.

### Peran Tim

Satu laptop menjalankan Claude Code (driver). Anggota lain memegang peran berikut dan bergilir tiap Demo dan di Lab:

| Peran | Tugas |
| --- | --- |
| Driver | Menempel prompt, membacakan setiap permintaan izin, menekan pilihan setelah navigator setuju |
| Navigator | Membaca rencana dan permintaan izin agent, memutuskan **Yes** atau **No** |
| Reviewer | Menjalankan cek sendiri (`npm test`, query cek di Oracle, `node scripts/cek-setoran.js`) dan membaca diff dengan `review/checklist-review.md` |
| Security checker | Mengisi `review/log-approval.md`, mengawasi `.env`, data asli, dan instruksi yang datang dari file data |

Tim bertiga: reviewer merangkap security checker. Akun Claude hanya dipakai pemiliknya di laptopnya sendiri. Kalau tim hanya punya satu akun, driver tetap pemilik akun sepanjang lab, dan peran navigator, reviewer, security checker yang bergilir.

Aturan izin selama lab:
- Pilih **1. Yes** untuk setiap permintaan izin, kecuali navigator menolak. Jangan pilih **Yes, and switch to auto mode**: lab ini melatih approval checkpoint.
- **Yes, and don't ask again** hanya untuk `npm test`.
- Catat setiap permintaan izin di `review/log-approval.md`.

### Kriteria Selesai

- [ ] Status bar menampilkan `manual mode on` saat Claude Code dibuka di folder lab
- [ ] `CLAUDE.md` punya bagian "Aturan Tim" dan ter-commit
- [ ] `db/cek-seed-tambahan.sql`: 5 / 6 / 20, semua `COCOK`, `0` transaksi di rekening tidak aktif, lalu `ROLLBACK`
- [ ] `node scripts/cek-setoran.js` berakhir dengan `OK  bentuk data sesuai aturan`, dan setiap beda dengan tanda tim sudah diputuskan
- [ ] `npm test` lulus semua, test lebih banyak dari 10, dan input berbahaya hanya ada di `binds`
- [ ] Sebelum Lab, `git log --oneline` berisi commit awal + Demo 1, 2, 3 (3.1), dan 4 (4.1)
- [ ] `review/log-approval.md` terisi minimal 6 baris dari Demo
- [ ] Lab: `node challenge/cek-lab.mjs` menampilkan skor otomatis (target minimal 48 dari 80, setara 60%)

## Verifikasi & Expected Result

| Cek | Expected result |
| --- | --- |
| Claude Code dibuka di folder lab | `⏸ manual mode on` |
| Agent diminta membaca `.env` | Ditolak: `File is in a directory that is denied by your permission settings.` atau `permission denied · rule from shared project settings` |
| `db/cek-seed-tambahan.sql` setelah seed | `5`, `6`, `20`; semua `COCOK`; `0` |
| `node scripts/cek-setoran.js` | `Catatan: 12 | Record: 12`, minimal satu baris `perlu_cek`, akhir `OK  bentuk data sesuai aturan` |
| `npm test` setelah 3.1 dan 4.1 | `fail 0`, jumlah `tests` lebih dari 10 |
| `node scripts/cetak-query.js mutasi "SIM-1000001' OR '1'='1" 2026-03` setelah 3.1 | SQL memakai `:account_no`, input hanya ada di `binds` |
| `git log --oneline` sebelum Lab | 5 commit: commit awal + 1.6 + 2.3 + 3.1 + 4.1 |
| `node challenge/cek-lab.mjs` sebelum Lab dikerjakan | `Subtotal otomatis 0 / 80` |
| `node challenge/cek-lab.mjs` setelah Lab | Tabel 7 kriteria dan `Subtotal otomatis [N] / 80`; test dan commit Lab berbeda tiap tim |

Jawaban agent (kalimat, urutan, nama test) berbeda tiap tim dan tiap run. Yang dinilai adalah hasil cek di atas, bukan kemiripan teks.

## Troubleshooting

| Masalah / Error | Penyebab | Solusi |
| --- | --- | --- |
| `Not logged in · Please run /login` | Belum login di terminal ini | Jalankan `claude`, ketik `/login`, ikuti browser |
| Status bar `⏵⏵ auto mode on`, bukan `manual mode on` | Claude Code dibuka di luar folder yang sedang dikerjakan (`demo-1` sampai `demo-4`, atau `lab`), atau folder belum di-trust | `/exit`, `cd` ke folder yang sedang dikerjakan (`demo-1` sampai `demo-4`, atau `lab`), jalankan `claude` lagi dan pilih **Yes, I trust this folder** |
| Prompt terkirim sepotong saat diketik ulang | Enter mengirim prompt | Tempel isi file dari `prompts/`, jangan diketik ulang |
| `/security-review` gagal: `fatal: ambiguous argument 'origin/HEAD...': unknown revision` | Repo lab tidak punya remote `origin` | Pakai `prompts/c3-review-keamanan.txt` |
| `ORA-00001: unique constraint ... violated` saat menjalankan seed | Seed dijalankan dua kali tanpa `ROLLBACK`, atau kode di luar rentang `2xxx` | `ROLLBACK;`, cek rentang kode di seed, jalankan sekali saja |
| `ORA-02291: integrity constraint ... parent key not found` | Cabang `KCP-SIM-0x` belum ada di `ALP_DEV` | Jalankan `db/catchup/01-schema.sql` dan `02-seed.sql`, atau sesuaikan kode cabang di prompt |
| `ORA-00942: table or view does not exist` | Tabel sesi 22 belum ada | Jalankan `db/catchup/` |
| `GAGAL  data/setoran.json tidak bisa dibaca sebagai JSON` | Agent menulis teks lain di luar array JSON | Minta agent menulis ulang file sesuai OUTPUT FORMAT |
| Shift+Tab tidak mengubah mode di Windows | Shortcut terminal berbeda | Ketik `/plan` di depan prompt 3.1 sebagai gantinya |
| `cek-lab.mjs`: `challenge/lab.json tidak bisa dibaca` | Perintah dijalankan di luar folder lab, atau JSON rusak (koma, kutip) | Pindah ke folder yang sedang dikerjakan (`demo-1` sampai `demo-4`, atau `lab`); periksa baris yang disebut pesan error |
| `cek-lab.mjs`: `commit test harus dibuat sebelum file modul ada` | Test dan modul masuk commit yang sama, atau modul di-commit lebih dulu | Kerjakan fitur berikutnya dengan nama modul baru mengikuti urutan L.3 lalu L.4, dan perbarui `lab.json` serta prompt |
| Limit pemakaian akun habis | Kuota per 5 jam terpakai | Lanjutkan peran reviewer/security checker di laptop lain; tunggu reset atau pakai akun cadangan dari penyelenggara |

## Cleanup

Data seed tambahan sudah dibatalkan dengan `ROLLBACK` di 2.1. Container `oracle-alp` tetap dipakai di sesi berikutnya: setelah kelas cukup `docker stop oracle-alp`. Hapus `.env` latihan kalau repo ini akan dibagikan.

Pola yang sama (aturan di `CLAUDE.md`, prompt berstruktur, cek di luar AI, review sebelum commit) dipakai terus di sesi 25–56 saat membangun REST API dan aplikasi ALP. Sesi 25 mulai dari Node.js runtime, modul, dan event.
