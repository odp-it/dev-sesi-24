# Troubleshooting

[Kembali ke README](README.md)

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
| Limit pemakaian akun habis | Kuota per 5 jam terpakai | Lanjutkan peran reviewer/security checker di laptop lain; tunggu reset atau pakai akun cadangan tim |
