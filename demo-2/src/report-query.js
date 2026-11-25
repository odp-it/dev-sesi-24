// Query laporan untuk dashboard operasional Tabungan UMKM.
// Fungsi di sini hanya menyusun SQL dan binds. Eksekusi ke Oracle
// (connection.execute(sql, binds)) dibahas di sesi 30.

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Mutasi satu rekening dalam satu bulan.
 * @param {string} accountNo contoh 'SIM-1000001'
 * @param {string} month format 'YYYY-MM', contoh '2026-03'
 */
export function mutasiRekening(accountNo, month) {
  if (!MONTH.test(month)) {
    throw new Error('month harus berformat YYYY-MM');
  }
  const sql =
    "SELECT t.txn_at, t.txn_type, t.category, t.amount, t.ref_no\n" +
    "  FROM transactions t\n" +
    "  JOIN accounts a ON a.account_id = t.account_id\n" +
    " WHERE a.account_no = '" + accountNo + "'\n" +
    "   AND t.txn_at >= TO_TIMESTAMP('" + month + "-01', 'YYYY-MM-DD')\n" +
    "   AND t.txn_at < ADD_MONTHS(TO_TIMESTAMP('" + month + "-01', 'YYYY-MM-DD'), 1)\n" +
    " ORDER BY t.txn_at";
  return { sql, binds: {} };
}

/**
 * Total saldo rekening per cabang.
 * @param {string} branchCode contoh 'KCP-SIM-01'
 */
export function saldoCabang(branchCode) {
  const sql =
    "SELECT b.branch_code, b.branch_name, COUNT(a.account_id) AS jumlah_rekening, SUM(a.balance) AS total_saldo\n" +
    "  FROM branches b\n" +
    "  JOIN customers c ON c.branch_id = b.branch_id\n" +
    "  JOIN accounts a ON a.customer_id = c.customer_id\n" +
    ` WHERE b.branch_code = '${branchCode}'\n` +
    " GROUP BY b.branch_code, b.branch_name";
  return { sql, binds: {} };
}
