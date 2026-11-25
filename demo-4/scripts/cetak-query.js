// Mencetak SQL dan binds dari src/report-query.js supaya bisa dicek atau dijalankan di SQL client.
// Pakai:
//   node scripts/cetak-query.js mutasi SIM-1000001 2026-03
//   node scripts/cetak-query.js saldo KCP-SIM-01
import { mutasiRekening, saldoCabang } from '../src/report-query.js';

const [jenis, ...args] = process.argv.slice(2);
const builders = { mutasi: mutasiRekening, saldo: saldoCabang };

if (!builders[jenis]) {
  console.error('Pakai: node scripts/cetak-query.js mutasi <account_no> <YYYY-MM>');
  console.error('   atau node scripts/cetak-query.js saldo <branch_code>');
  process.exit(1);
}

const { sql, binds } = builders[jenis](...args);
console.log(sql + ';');
console.log('-- binds: ' + JSON.stringify(binds));
