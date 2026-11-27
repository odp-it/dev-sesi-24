# Demo 3 · Perbaikan Keamanan

[Persiapan](../README.md) · [Troubleshooting](../TROUBLESHOOTING.md)

> Hasil Demo 1 sampai Demo 2 sudah terisi di folder ini. Buka folder ini langsung di VS Code dan lakukan persiapan project di sini (`.env`, install, atau `git init`).

Kerjakan 3.1-3.2: perbaiki query dengan plan mode, lalu review keamanan.

**Demo instruktur (±25 menit):** hallucination, prompt injection, SQL disambung string di Oracle, data yang tidak boleh masuk prompt, deny rule, lisensi kode dari AI, cara review diff, dan `/rewind`. **Ikuti (±25 menit):** langkah 3.1-3.2 (5 menit sebelum coffee break, 20 menit sesudahnya).

## 3.1 Bind variable di `report-query.js`, dengan plan mode

1. Lihat dulu masalahnya. Di terminal kedua (tombol **+** di panel Terminal):

```bash
node scripts/cetak-query.js mutasi "SIM-1000001' OR '1'='1" 2026-03
```

Input masuk utuh ke teks SQL (`WHERE a.account_no = 'SIM-1000001' OR '1'='1'`) dan `binds` kosong.

2. Di Claude Code, tekan **Shift+Tab** dua kali sampai status bar menjadi `⏸ plan mode on`.
3. Tempel isi `prompts/c1-perbaiki-query.txt`. Claude Code membaca kode lalu menampilkan plan dengan pertanyaan `Would you like to proceed?`.
4. Navigator dan reviewer membaca plan: file yang diubah hanya dua, test ditulis dulu, nama fungsi tetap. Kalau setuju, pilih **2. Yes, manually approve edits**. Pilihan yang tersorot pertama kali adalah **1. Yes, and use auto mode**, jadi tekan panah bawah dulu. Kalau tidak setuju, pilih **3. Tell Claude what to change** dan tulis koreksinya.
5. Setujui edit satu per satu setelah membaca diff-nya.
6. Reviewer menjalankan sendiri:

```bash
npm test
node scripts/cetak-query.js mutasi "SIM-1000001' OR '1'='1" 2026-03
```

Yang harus terlihat: `fail 0`, jumlah test bertambah dari 10, SQL berisi `:account_no` dan `:month_start`, dan input berbahaya hanya muncul di baris `-- binds: {...}`.

7. Commit:

```bash
git add src/report-query.js test/report-query.test.js && git commit -m "fix(report): pakai bind variable untuk input laporan"
```

## 3.2 Review keamanan

1. Reviewer mengisi bagian **Lingkup** dan **Aman** di `review/checklist-review.md` dari `git show HEAD` (commit 3.1).
2. Minta second opinion dari agent dengan prompt read-only `prompts/c3-review-keamanan.txt`. Saat ini perubahan yang ada hanya commit 3.1, jadi yang diulas hanya `report-query.js`.
3. Untuk setiap temuan agent: cek buktinya di kode. Temuan yang benar tapi di luar lingkup 3.1 dicatat sebagai tiket di log approval, tidak langsung diperbaiki.

## Tantangan tambahan Demo 3 (opsional)

1. Buktikan perbaikan 3.1 di Oracle, bukan hanya di test. Cetak SQL dengan `node scripts/cetak-query.js mutasi "SIM-1000001' OR '1'='1" 2026-03`. Di SQL Developer (atau SQL*Plus) deklarasikan variabel bind, isi `:account_no` dengan nilai berbahaya itu dan `:month_start` dengan `2026-03-01`, lalu jalankan SQL-nya. Bandingkan dengan SQL versi sebelum 3.1: tulis `WHERE a.account_no = 'SIM-1000001' OR '1'='1'` seperti yang tercetak di langkah 3.1 nomor 1 (input disambung ke teks SQL). Berapa baris masing-masing?
2. `saldoCabang` mempunyai celah yang sama. Ulangi dengan `node scripts/cetak-query.js saldo "KCP-SIM-01' OR '1'='1"` setelah 3.1 (isi `:branch_code` dengan input itu), dan bandingkan dengan SQL lama yang menyambung input ke `WHERE b.branch_code = '...'`: berapa baris masing-masing, dan cabang mana yang ikut terbaca?
