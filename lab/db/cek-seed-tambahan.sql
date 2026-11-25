-- Cek hasil db/seed-tambahan.sql (Bagian 2.1). Jalankan dengan Run Script (F5) setelah seed dijalankan.

-- 1. Jumlah data baru
SELECT 'nasabah' AS data, COUNT(*) AS jumlah FROM customers WHERE cif_no LIKE 'CIF-SIM-2%'
UNION ALL
SELECT 'rekening', COUNT(*) FROM accounts WHERE account_no LIKE 'SIM-2%'
UNION ALL
SELECT 'transaksi', COUNT(*) FROM transactions WHERE ref_no LIKE 'REF-SIM-2%';

-- 2. Rekonsiliasi: saldo rekening dibanding total transaksinya
SELECT a.account_no,
       a.status,
       a.balance,
       NVL(SUM(CASE WHEN t.txn_type IN ('SETOR', 'TRANSFER_MASUK') THEN t.amount ELSE -t.amount END), 0) AS total_transaksi,
       CASE
         WHEN a.balance = NVL(SUM(CASE WHEN t.txn_type IN ('SETOR', 'TRANSFER_MASUK') THEN t.amount ELSE -t.amount END), 0)
         THEN 'COCOK' ELSE 'SELISIH'
       END AS rekonsiliasi
  FROM accounts a
  LEFT JOIN transactions t ON t.account_id = a.account_id
 WHERE a.account_no LIKE 'SIM-2%'
 GROUP BY a.account_no, a.status, a.balance
 ORDER BY a.account_no;

-- 3. Transaksi di rekening yang tidak AKTIF (harus 0)
SELECT COUNT(*) AS txn_rekening_tidak_aktif
  FROM transactions t
  JOIN accounts a ON a.account_id = t.account_id
 WHERE a.account_no LIKE 'SIM-2%'
   AND a.status <> 'AKTIF';
