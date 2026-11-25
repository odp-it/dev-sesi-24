# 24 - Claude Code & Responsible AI-assisted Coding

Lab ini memakai Claude Code di repo kecil Tabungan UMKM untuk tiga pekerjaan: mengenali code base, membuat data dari input terstruktur dan tidak terstruktur, lalu memperbaiki kode yang tidak aman dengan test. Semua dikerjakan per tim dengan peran bergilir, dan setiap hasil AI dicek dengan alat yang tidak bergantung pada AI: Oracle, skrip cek, dan `npm test`. Hasil akhirnya: `CLAUDE.md` berisi aturan tim, seed tambahan yang lolos constraint, hasil ekstraksi catatan setoran, perbaikan SQL injection dan aturan validasi dengan test lulus, plus log approval.

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

## Studi Kasus

Tim melanjutkan aplikasi contoh **Tabungan UMKM** untuk bank fiktif. Code base ini menyiapkan validasi transaksi dan query laporan yang nanti dipakai REST API di sesi 29–33. Tim operasional juga mengirim dua bahan: kebutuhan data contoh tambahan untuk uji laporan, dan catatan setoran petugas lapangan yang ditulis bebas di chat. Semua data di lab ini data simulasi: rekening `SIM-`, CIF `CIF-SIM-`, email `@example.com`. Data nasabah asli, kredensial, dan kode internal tidak boleh masuk ke prompt.

## Peran Tim

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

## Bantuan

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md): pesan error dan cara memperbaikinya.
- [CHECKLIST.md](CHECKLIST.md): hasil yang harus terlihat dan kriteria selesai.

## Cleanup

Data seed tambahan sudah dibatalkan dengan `ROLLBACK` di 2.1. Container `oracle-alp` tetap dipakai di sesi berikutnya: setelah selesai cukup `docker stop oracle-alp`. Hapus `.env` latihan kalau repo ini akan dibagikan.

Pola yang sama (aturan di `CLAUDE.md`, prompt berstruktur, cek di luar AI, review sebelum commit) dipakai terus di sesi 25–56 saat membangun REST API dan aplikasi ALP. Sesi 25 mulai dari Node.js runtime, modul, dan event.
