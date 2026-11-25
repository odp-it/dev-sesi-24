// Validasi transaksi Tabungan UMKM sebelum disimpan ke tabel TRANSACTIONS.
// Kode error mengikuti kontrak API sesi 29 (INSUFFICIENT_BALANCE, ACCOUNT_BLOCKED, ...).

export const TXN_TYPES = ['SETOR', 'TARIK', 'TRANSFER_MASUK', 'TRANSFER_KELUAR'];
export const CATEGORIES = ['PENJUALAN', 'BAHAN_BAKU', 'OPERASIONAL', 'GAJI', 'TRANSFER', 'LAINNYA'];

const DEBIT_TYPES = new Set(['TARIK', 'TRANSFER_KELUAR']);
const REF_NO = /^REF-SIM-\d{6}$/;

/**
 * @param {{ txnType: string, category: string, amount: number, refNo: string }} txn
 * @param {{ accountNo: string, balance: number, status: string }} account
 * @returns {{ valid: boolean, errors: { field: string, code: string }[] }}
 */
export function validateTransaction(txn, account) {
  const errors = [];

  if (!TXN_TYPES.includes(txn.txnType)) {
    errors.push({ field: 'txnType', code: 'INVALID_TXN_TYPE' });
  }
  if (!CATEGORIES.includes(txn.category)) {
    errors.push({ field: 'category', code: 'INVALID_CATEGORY' });
  }
  if (!REF_NO.test(txn.refNo ?? '')) {
    errors.push({ field: 'refNo', code: 'INVALID_REF_NO' });
  }
  if (DEBIT_TYPES.has(txn.txnType) && txn.amount > account.balance) {
    errors.push({ field: 'amount', code: 'INSUFFICIENT_BALANCE' });
  }

  return { valid: errors.length === 0, errors };
}
