// Template test fitur ALP tim. Salin ke path "test" di challenge/lab.json, lalu ganti semua ISI_.
// Test ditulis dan di-commit SEBELUM file modul dibuat.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ISI_NAMA_FUNGSI } from '../src/alp/ISI_NAMA_FILE.js';

const codes = (result) => result.errors.map((e) => e.code);

test('ISI: kasus normal valid', () => {
  assert.deepEqual(ISI_NAMA_FUNGSI({}), { valid: true, errors: [] });
});

test('ISI: pelanggaran aturan 1 ditolak ISI_KODE_ERROR', () => {
  assert.deepEqual(codes(ISI_NAMA_FUNGSI({})), ['ISI_KODE_ERROR']);
});

// TODO: tambah sampai minimal 5 test (nilai tepat di batas, nilai di luar batas, tipe yang salah).
