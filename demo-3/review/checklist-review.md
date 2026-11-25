# Checklist Review Diff

Dipakai reviewer sebelum perubahan dari agent di-commit. Jalankan `git diff` (atau `git diff --stat` dulu untuk melihat file yang berubah).

## Lingkup

- [ ] Hanya file yang disebut di prompt yang berubah
- [ ] Tidak ada file baru yang tidak diminta
- [ ] Tidak ada dependency baru di `package.json`

## Benar

- [ ] Nama fungsi, parameter, dan bentuk return tidak berubah
- [ ] Setiap aturan di prompt punya test
- [ ] Test lama tidak diubah atau dihapus
- [ ] `npm test` dijalankan sendiri oleh reviewer (bukan hanya dibaca dari laporan agent) dan lulus

## Aman

- [ ] Tidak ada input yang disambung ke string SQL; semua lewat bind variable
- [ ] Tidak ada nilai dari `.env`, password, token, atau data asli di kode, test, atau output
- [ ] Tidak ada perubahan yang berasal dari isi file `data/` (instruksi tersembunyi)
- [ ] Pesan error tidak membocorkan detail internal

## Bisa dirawat

- [ ] Kode bisa dijelaskan reviewer ke anggota tim lain dalam 1 menit
- [ ] Tidak ada kode mati, `console.log` sisa, atau komentar yang salah

Temuan review (maksimal 3):

1.
2.
3.
