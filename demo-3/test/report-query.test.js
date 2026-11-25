import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mutasiRekening, saldoCabang } from '../src/report-query.js';

test('mutasiRekening membaca TRANSACTIONS untuk satu rekening, urut waktu', () => {
  const { sql } = mutasiRekening('SIM-1000001', '2026-03');
  assert.match(sql, /FROM transactions t/);
  assert.match(sql, /a\.account_no =/);
  assert.match(sql, /ORDER BY t\.txn_at/);
});

test('mutasiRekening menolak bulan yang bukan YYYY-MM', () => {
  assert.throws(() => mutasiRekening('SIM-1000001', 'Maret 2026'), /YYYY-MM/);
  assert.throws(() => mutasiRekening('SIM-1000001', '2026-13'), /YYYY-MM/);
});

test('saldoCabang menjumlahkan saldo per cabang', () => {
  const { sql } = saldoCabang('KCP-SIM-01');
  assert.match(sql, /SUM\(a\.balance\)/);
  assert.match(sql, /GROUP BY b\.branch_code/);
});

test('hasil selalu punya sql (string) dan binds (object)', () => {
  for (const q of [mutasiRekening('SIM-1000001', '2026-03'), saldoCabang('KCP-SIM-01')]) {
    assert.equal(typeof q.sql, 'string');
    assert.equal(typeof q.binds, 'object');
  }
});
