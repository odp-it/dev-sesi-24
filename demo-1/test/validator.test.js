import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTransaction } from '../src/validator.js';

const rekeningAktif = { accountNo: 'SIM-1000001', balance: 1_000_000, status: 'AKTIF' };
const setor = { txnType: 'SETOR', category: 'PENJUALAN', amount: 250_000, refNo: 'REF-SIM-000101' };

const codes = (result) => result.errors.map((e) => e.code);

test('setoran normal ke rekening aktif valid', () => {
  const result = validateTransaction(setor, rekeningAktif);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('penarikan sampai saldo habis valid', () => {
  const tarik = { ...setor, txnType: 'TARIK', category: 'BAHAN_BAKU', amount: 1_000_000 };
  assert.equal(validateTransaction(tarik, rekeningAktif).valid, true);
});

test('penarikan melebihi saldo ditolak INSUFFICIENT_BALANCE', () => {
  const tarik = { ...setor, txnType: 'TARIK', category: 'BAHAN_BAKU', amount: 1_500_000 };
  assert.deepEqual(codes(validateTransaction(tarik, rekeningAktif)), ['INSUFFICIENT_BALANCE']);
});

test('jenis transaksi di luar daftar ditolak INVALID_TXN_TYPE', () => {
  const txn = { ...setor, txnType: 'TOPUP' };
  assert.deepEqual(codes(validateTransaction(txn, rekeningAktif)), ['INVALID_TXN_TYPE']);
});

test('kategori di luar daftar ditolak INVALID_CATEGORY', () => {
  const txn = { ...setor, category: 'HIBURAN' };
  assert.deepEqual(codes(validateTransaction(txn, rekeningAktif)), ['INVALID_CATEGORY']);
});

test('nomor referensi tanpa format REF-SIM ditolak INVALID_REF_NO', () => {
  const txn = { ...setor, refNo: 'REF-000101' };
  assert.deepEqual(codes(validateTransaction(txn, rekeningAktif)), ['INVALID_REF_NO']);
});
