# Demo 1 · Setup & Kenali Code Base (±40 menit)

> Folder ini project lengkap. Isinya starter: belum ada Demo yang diisi.
> Buka folder ini langsung di VS Code, lalu lakukan persiapan di [README utama](../README.md) (mis. salin `.env`, install, atau `git init`) **di folder ini**. Semua path relatif terhadap folder ini.

**Peraga (±20 menit):** cara kerja coding agent, permission mode, `CLAUDE.md`, git sebagai jaring pengaman, lalu membuka folder lab: dialog trust, status bar, dan satu permintaan izin nyata. **Ikuti (±20 menit):** langkah 1.1–1.6 di bawah.

## 1.1 Siapkan repo (±3 menit)

Buka folder `demo-1` di VS Code, lalu buka terminal (**Terminal > New Terminal**). Jadikan titik awal ini commit pertama, supaya setiap perubahan dari agent terlihat di `git diff`.

Laptop yang belum pernah memakai Git belum punya identitas, dan commit pertama gagal dengan `Author identity unknown` (`*** Please tell me who you are.`). Cek dulu dengan `git config --global user.name`; kalau kosong, isi sekali (nama dan email contoh, ganti dengan milik sendiri):

```bash
git config --global user.name "Nama Anda"
git config --global user.email "nama@example.com"
```

Lalu:

```bash
git init -b main
git add .
git commit -m "chore: titik awal lab sesi 24"
cp .env.example .env
npm test
```

```powershell
# Windows PowerShell: sama, kecuali menyalin .env
Copy-Item .env.example .env
```

Di Windows, `git add .` mencetak banyak baris `warning: LF will be replaced by CRLF`. Peringatan ini boleh diabaikan.

Yang harus terlihat di akhir `npm test`:

```text
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

`.env` sengaja dibuat untuk latihan deny rule. Isinya tetap `ISI_...` dan tidak di-commit (`.gitignore`).

## 1.2 Jalankan Claude Code (±2 menit)

```bash
claude
```

Saat pertama kali, muncul dialog `Accessing workspace:` dengan pertanyaan apakah folder ini dipercaya. Pilih **Yes, I trust this folder**, lalu Enter. Dialog yang sama menjelaskan bahwa trust memuat `.claude/settings.json`.

Yang harus terlihat di bawah kotak prompt:

```text
⏸ manual mode on · ? for shortcuts
```

`manual mode` berasal dari `.claude/settings.json` (`"defaultMode": "default"`). Tanpa file itu, Claude Code versi sekarang mulai di `auto mode`.

## 1.3 Minta penjelasan repo, read-only (±6 menit)

Buka `prompts/a1-kenali-repo.txt` di VS Code, salin semua isinya, tempel ke Claude Code, lalu Enter. Prompt panjang tampil sebagai `[Pasted text #1 +14 lines]`: itu normal.

Claude Code akan meminta izin menjalankan perintah baca (`cat`, `npm test`). Navigator membaca perintahnya: kalau hanya membaca atau menjalankan test, pilih **1. Yes**. Untuk `npm test`, boleh pilih **Yes, and don't ask again for: npm test \***.

Yang harus terlihat: tabel file, perintah `npm test`, dan maksimal 5 temuan dengan `file:baris`. Reviewer mencocokkan minimal 2 temuan dengan membuka file dan baris yang disebut.

## 1.4 Buat `CLAUDE.md` dengan `/init` (±4 menit)

Ketik `/init`, Enter. Claude Code membaca repo, lalu meminta izin:

```text
Do you want to create CLAUDE.md?
```

Navigator membaca isi yang diusulkan sebelum memilih **1. Yes**.

## 1.5 Tambahkan aturan tim (±3 menit)

Tempel isi `prompts/a2-rapikan-claude-md.txt`. Claude Code menampilkan diff dan bertanya `Do you want to make this edit to CLAUDE.md?`. Cek bahwa baris bertanda `+` hanya bagian "Aturan Tim", lalu pilih **1. Yes**.

## 1.6 Commit oleh tim (±2 menit)

Commit dilakukan manusia, bukan agent. Di kotak prompt Claude Code, ketik `!` untuk masuk mode bash (perintah dijalankan langsung oleh tim, bukan oleh agent), lalu:

```bash
git add CLAUDE.md && git commit -m "docs: CLAUDE.md dari /init + aturan tim"
```

Output perintah dari mode bash ikut masuk ke percakapan. Jangan pernah menjalankan `!cat .env` atau perintah lain yang mencetak rahasia.

Ganti peran untuk Demo 2.

## Tantangan tambahan Demo 1 (opsional)

Kerjakan tanpa agent: tugas reviewer adalah mengecek klaim agent dengan alat sendiri.

1. Dari tabel file dan temuan di 1.3, cek tiga hal sendiri: jumlah test per file (`node --test test/validator.test.js`, lalu `test/report-query.test.js`), daftar fungsi yang di-export tiap file di `src/` (`node --input-type=module -e "import * as m from './src/validator.js'; console.log(Object.keys(m))"`), dan jumlah total test dari `npm test`. Cocokkan dengan klaim agent.
2. Buktikan bahwa `.env` tidak ikut ke riwayat Git: `git status --short`, `git check-ignore -v .env`, dan `git ls-files` (cari berkas berawalan `.env`). Tulis satu kalimat: aturan mana yang menahannya?
