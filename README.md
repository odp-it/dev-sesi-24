# 24 - Claude Code & Responsible AI-assisted Coding

Lab ini memakai Claude Code di repo kecil Tabungan UMKM untuk tiga pekerjaan: mengenali code base, membuat data dari input terstruktur dan tidak terstruktur, lalu memperbaiki kode yang tidak aman dengan test. Semua dikerjakan per tim dengan peran bergilir, dan setiap hasil AI dicek dengan alat yang tidak bergantung pada AI: Oracle, skrip cek, dan `npm test`. Hasil akhirnya: `CLAUDE.md` berisi aturan tim, seed tambahan yang lolos constraint, hasil ekstraksi catatan setoran, dan perbaikan SQL injection dengan test lulus, plus log approval. Aturan validasi (Demo 4) diperagakan instruktur dan latihan fitur ALP dengan test dikerjakan mandiri di luar kelas. Di akhir sesi, tiap kelompok mempresentasikan database ALP dari sesi 21–23 (16.00–17.00).

## Environment & Tools

Siapkan sebelum mulai. Versi dikunci: jangan update tool di tengah pengerjaan. Channel stable bergerak: versi yang terpasang bisa lebih baru dari 2.1.330 dan tampilannya boleh sedikit berbeda dari tangkapan di materi.

| Tool | Versi | Catatan |
| --- | --- | --- |
| Claude Code | Channel `stable` (diuji dengan 2.1.330) | Native installer, tanpa hak admin. Login dengan akun tim |
| Akun Claude | Akun tim | Akun milik satu orang hanya dipakai pemiliknya, di laptopnya sendiri. Lihat **Peran Tim** |
| Node.js | 26 LTS (fallback 24 LTS) | Lab ini tanpa dependency, tanpa `npm install` |
| Git | 2.x | Sudah dipakai sejak sesi sebelumnya |
| VS Code + **Oracle SQL Developer for VS Code** | 26.3.x | Koneksi `ALP_DEV @ FREEPDB1` dari sesi 21 |
| Oracle Database Free (container `oracle-alp`) | `23.26.4.0-lite` | Schema `ALP_DEV` dengan tabel dan data sesi 22 |

Pasang Claude Code channel stable (sekali, sebelum mulai):

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash -s stable
```

```powershell
# Windows PowerShell
& ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable
```

Ukuran unduhan Claude Code ±370 MB (di Windows `claude.exe` 372 MB, ±2,5 menit di jaringan cepat). Di jaringan berkuota, pasang sebelum mulai. Installer Windows memasang ke `%USERPROFILE%\.local\bin` dan bisa menulis `.local\bin is not in your PATH`: tutup dan buka terminal baru; bila `claude` masih `not recognized`, tambahkan `%USERPROFILE%\.local\bin` ke PATH user (Environment Variables), lalu buka terminal baru.

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

## Claude Code untuk Repo Kelompok

Claude Code adalah asisten, bukan pengganti. Kelompok boleh memakainya untuk melengkapi repo ALP sebelum presentasi dan setelah kelas, dengan aturan sesi 24: manual mode, review diff sebelum menyetujui edit, tanpa data asli, dan commit dilakukan manusia. Tiap Demo punya padanan di repo kelompok.

| Demo sesi 24 | Pemakaian di repo kelompok | File yang disentuh |
| --- | --- | --- |
| Demo 1 · `CLAUDE.md` dan aturan tim | Buat `CLAUDE.md` repo kelompok: awalan tabel, data simulasi, larangan `DROP` tanpa izin | `CLAUDE.md` |
| Demo 2.1 · seed dari schema | Tambah data contoh dari `db/01-ddl.sql` kelompok, lalu cek dengan `db/03-test-invalid.sql` dan `cek-lab.sql` | `db/02-seed.sql` |
| Demo 3 · review keamanan | Periksa query di `db/05-laporan.sql` dan peta fitur: pakai bind variable, bukan string disambung | `db/05-laporan.sql`, `README.md` |
| Demo 4 · test dulu | Latihan mandiri (lihat bagian Lab di bawah): aturan bisnis tema kelompok dengan test | `src/alp/`, `test/` |

Langkah umum:

1. Buka repo kelompok di VS Code, jalankan `claude` dari folder repo (status bar harus `manual mode on`). Repo kelompok belum punya `.claude/settings.json`: salin dari folder lab ini, atau tekan Shift+Tab sampai kembali ke manual mode.
2. Tempel prompt CONTEXT / TASK / RULES / OUTPUT FORMAT. RULES memuat awalan tabel kelompok, data simulasi berpenanda `SIM`, dan file yang boleh berubah.
3. Baca diff sebelum menyetujui. Jalankan sendiri `00-run-all.sql` dan `cek-lab.sql`; jangan percaya laporan agent.
4. Commit oleh anggota kelompok, bukan agent.

Data dan kode asli BNI tidak boleh masuk prompt. Seed tambahan yang berasal dari agent harus lolos constraint dan dicek di Oracle sebelum di-commit.

## Presentasi Project Kelompok (16.00–17.00)

7 kelompok × (5 menit presentasi + 3 menit tanya jawab). **Tanpa slide**: README repo kelompok menjadi alur bicara, demo langsung di VS Code dari laptop salah satu anggota. Urutan diumumkan di akhir sesi 23. Kelompok berikutnya menyiapkan laptop selama tanya jawab kelompok sebelumnya.

### Alur 5 menit

1. Masalah, pengguna, fitur MVP (30 detik).
2. ERD: entity pusat, relasi, tabel pengguna + role, satu aturan data penting dengan alasan bisnis.
3. Demo langsung: `00-run-all.sql` jalan, satu input salah ditolak (tampilkan kode ORA), view laporan tampil.
4. Peta fitur → tabel → query: 2–3 endpoint pertama untuk backend.

### Checklist sebelum presentasi

- [ ] `00-run-all.sql` jalan dua kali berturut-turut tanpa error, di laptop yang dipakai presentasi.
- [ ] ERD punya tabel pengguna + role; ERD dan kamus sama dengan tabel di database.
- [ ] `03-test-invalid.sql` minimal 3 perintah ditolak, kode ORA dicatat di komentar.
- [ ] Empat view laporan ada; `<awalan>_cek_validasi` 0 baris.
- [ ] Bagian "Bukti cek" di README terisi (skor `cek-erd.py`, `cek-lab.sql` sesi 22 dan 23).
- [ ] Semua bagian `TODO` di README terisi.
- [ ] Koneksi `ALP_DEV @ FREEPDB1` aktif dan `docker ps` menunjukkan `oracle-alp (healthy)`.

### Rubrik project (100 poin)

Dinilai instruktur saat presentasi. Repo pukul 23.59 hanya untuk serah terima.

| Komponen | Poin | Yang ditunjukkan | Cara menilai |
| --- | --- | --- | --- |
| A. ERD + kamus data | 25 | ERD, skor `cek-erd.py` | Skor ÷ 80 × 15; entity sesuai fitur MVP (4); tabel pengguna + role (3); satu aturan data dijelaskan alasannya (3) |
| B. Database | 35 | `00-run-all.sql` live, skor `cek-lab.sql` 22, satu input salah | Skor ÷ 80 × 25; bangun ulang live tanpa error (5); input salah ditolak dengan kode ORA (3); data contoh masuk akal untuk tema (2) |
| C. Laporan + kesiapan backend | 15 | View laporan, peta fitur di README | `<awalan>_LAP_RINGKASAN` tampil dengan data (6); peta mencakup tiap fitur MVP (6); 2–3 endpoint pertama (3) |
| D. Penyampaian | 25 | | Masalah → data runtut (8); alur jelas, selesai 5 menit (7); tanya jawab dijawab dengan data/query (10) |

### Setelah presentasi

Tenggat push final: hari ini pukul 23.59. Kumpulkan link repo kelompok. Repo diserahkan ke pengajar backend (Node.js/Express) sebagai paket: `README.md`, `docs/` (ERD, kamus data, review), dan `db/` (`00-run-all.sql` sampai `07-index.sql`).

## Studi Kasus

Tim melanjutkan aplikasi contoh **Tabungan UMKM** untuk bank fiktif. Code base ini menyiapkan validasi transaksi dan query laporan yang nanti dipakai REST API di sesi 29–33. Tim operasional juga mengirim dua bahan: kebutuhan data contoh tambahan untuk uji laporan, dan catatan setoran petugas lapangan yang ditulis bebas di chat. Semua data di lab ini data simulasi: rekening `SIM-`, CIF `CIF-SIM-`, email `@example.com`. Data nasabah asli, kredensial, dan kode internal tidak boleh masuk ke prompt.

## Peran Tim

Satu laptop menjalankan Claude Code (driver). Anggota lain memegang peran berikut dan bergilir tiap Demo (Demo 4 diperagakan instruktur) dan di latihan mandiri:

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

## Bantuan

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md): pesan error dan cara memperbaikinya.
- [CHECKLIST.md](CHECKLIST.md): hasil yang harus terlihat dan kriteria selesai.

## Cleanup

Data seed tambahan sudah dibatalkan dengan `ROLLBACK` di 2.1. Container `oracle-alp` tetap dipakai di sesi berikutnya: setelah selesai cukup `docker stop oracle-alp`. Hapus `.env` latihan kalau repo ini akan dibagikan.

Pola yang sama (aturan di `CLAUDE.md`, prompt berstruktur, cek di luar AI, review sebelum commit) dipakai terus di sesi 25–56 saat membangun REST API dan aplikasi ALP. Sesi 25 mulai dari Node.js runtime, modul, dan event.
