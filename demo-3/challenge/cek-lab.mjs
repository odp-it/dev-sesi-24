// Sesi 24 · Lab: cek otomatis fitur ALP tim (80 poin otomatis; 20 poin dinilai manual).
// Pakai, dari folder lab (sama di macOS, Linux, dan Windows PowerShell):
//   node challenge/cek-lab.mjs
// Yang dibaca: challenge/lab.json, prompt tim, modul, test, review/log-approval.md, riwayat Git.
// File tim tidak diubah. Uji "test menangkap kesalahan" berjalan di salinan sementara yang langsung dihapus.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const root = process.cwd();
const catatan = []; // alasan poin berkurang
const rows = [];
const beri = (kriteria, hasil, poin, maks) => rows.push({ kriteria, hasil, poin, maks });

const ada = (rel) => Boolean(rel) && existsSync(path.join(root, rel));
const baca = (rel) => (ada(rel) ? readFileSync(path.join(root, rel), 'utf8') : '');

let lab;
try {
  lab = JSON.parse(readFileSync(path.join(root, 'challenge/lab.json'), 'utf8'));
} catch (err) {
  console.error(`GAGAL  challenge/lab.json tidak bisa dibaca: ${err.message}`);
  console.error('Jalankan dari folder lab (folder yang berisi package.json).');
  process.exit(1);
}

// Nilai yang masih berisi ISI_ dianggap belum diisi.
const terisi = (v) => typeof v === 'string' && v.trim() !== '' && !v.includes('ISI_');
const pathAman = (v) => terisi(v) && !path.isAbsolute(v) && !v.split(/[\\/]/).includes('..');
const modul = pathAman(lab.modul) && /^src\/alp\/[\w-]+\.js$/.test(lab.modul) ? lab.modul : null;
const fileTest = pathAman(lab.test) && /^test\/alp-[\w-]+\.test\.js$/.test(lab.test) ? lab.test : null;
const filePrompt = pathAman(lab.prompt) ? lab.prompt : null;
const fungsi = terisi(lab.fungsi) ? lab.fungsi : null;
if (!modul) catatan.push('lab.json: "modul" harus berpola src/alp/<nama>.js');
if (!fileTest) catatan.push('lab.json: "test" harus berpola test/alp-<nama>.test.js');
if (!fungsi) catatan.push('lab.json: "fungsi" belum diisi');

function git(...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim() };
}

function jalankanTest(cwd, file) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], {
    cwd, env, encoding: 'utf8', timeout: 30_000,
  });
  const angka = (k) => Number(new RegExp(`^# ${k} (\\d+)`, 'm').exec(r.stdout ?? '')?.[1] ?? 0);
  const hasil = { tests: angka('tests'), pass: angka('pass'), fail: angka('fail'), status: r.status };
  hasil.lulus = r.status === 0 && hasil.fail === 0 && hasil.pass > 0;
  return hasil;
}

// 1. Prompt tim berstruktur (10)
{
  const teks = filePrompt ? baca(filePrompt).replace(/\r/g, '') : '';
  const judul = ['CONTEXT', 'TASK', 'RULES', 'OUTPUT FORMAT'];
  const bagian = {};
  let aktif = null;
  for (const baris of teks.split('\n')) {
    if (judul.includes(baris.trim())) { aktif = baris.trim(); bagian[aktif] = ''; } else if (aktif) bagian[aktif] += `${baris}\n`;
  }
  const lengkap = judul.filter((j) => bagian[j]?.trim() && !bagian[j].includes('ISI_'));
  const sebutFile = Boolean(modul && fileTest && teks.includes(modul) && teks.includes(fileTest));
  beri('1. Prompt tim berstruktur', `${lengkap.length} dari 4 bagian`, lengkap.length * 2 + (sebutFile ? 2 : 0), 10);
  if (!teks) catatan.push(`prompt tim belum ada (${filePrompt ?? 'isi "prompt" di lab.json'})`);
  else {
    if (lengkap.length < 4) catatan.push(`prompt: bagian belum lengkap atau masih berisi ISI_: ${judul.filter((j) => !lengkap.includes(j)).join(', ')}`);
    if (!sebutFile) catatan.push('prompt: path modul dan path test harus disebut persis seperti di lab.json');
  }
}

// 2. Test tim lulus (15)
let hasilTest = null;
{
  if (fileTest && ada(fileTest)) hasilTest = jalankanTest(root, fileTest);
  const lulus = Boolean(hasilTest?.lulus && modul && ada(modul));
  const poin = lulus ? Math.round((15 * Math.min(hasilTest.pass, 5)) / 5) : 0;
  beri('2. Test tim lulus (min. 5 test)', hasilTest ? `${hasilTest.pass} lulus, ${hasilTest.fail} gagal` : 'belum ada test', poin, 15);
  if (hasilTest && !lulus) catatan.push(`node --test ${fileTest} belum lulus`);
}

// 3. Kasus penerimaan (20)
{
  const kasus = Array.isArray(lab.kasus) ? lab.kasus.filter((k) => !JSON.stringify(k).includes('ISI_')) : [];
  let fn = null;
  if (modul && fungsi && ada(modul)) {
    try {
      fn = (await import(pathToFileURL(path.join(root, modul)).href))[fungsi];
      if (typeof fn !== 'function') catatan.push(`${modul} tidak meng-export fungsi ${fungsi}`);
    } catch (err) {
      catatan.push(`${modul} gagal dimuat: ${err.message.split('\n')[0]}`);
    }
  }
  let cocok = 0;
  if (typeof fn === 'function') {
    for (const k of kasus) {
      try {
        if (isDeepStrictEqual(fn(...structuredClone(k.args)), k.hasil)) cocok += 1;
        else catatan.push(`kasus "${k.nama}": hasil fungsi berbeda dari "hasil" di lab.json`);
      } catch (err) {
        catatan.push(`kasus "${k.nama}": fungsi melempar error (${err.message.split('\n')[0]})`);
      }
    }
  }
  const kode = new Set(kasus.flatMap((k) => (k.hasil?.errors ?? []).map((e) => e.code)));
  const adaValid = kasus.some((k) => k.hasil?.valid === true);
  const komposisi = kasus.length >= 5 && adaValid && kode.size >= 3;
  let poin = Math.round((20 * cocok) / Math.max(kasus.length, 5));
  if (!komposisi) poin = Math.min(poin, 10);
  beri('3. Kasus penerimaan cocok', `${cocok} dari ${kasus.length} kasus`, poin, 20);
  if (!komposisi) catatan.push(`kasus: wajib min. 5 kasus, min. 1 valid, min. 3 kode error berbeda (sekarang ${kasus.length} kasus, ${kode.size} kode); tanpa itu maksimal 10 poin`);
}

// 4. Test menangkap kesalahan (10): test tim harus GAGAL bila fungsi diganti versi yang salah.
{
  let tertangkap = 0;
  if (hasilTest?.lulus && modul && fungsi && ada(modul)) {
    const salinan = mkdtempSync(path.join(tmpdir(), 'cek-lab-24-'));
    try {
      for (const f of ['package.json', 'src', 'test']) cpSync(path.join(root, f), path.join(salinan, f), { recursive: true });
      if (!jalankanTest(salinan, fileTest).lulus) {
        catatan.push('test tim bergantung pada file di luar src/ dan test/, uji kesalahan tidak bisa dijalankan');
      } else {
        const target = path.join(salinan, modul);
        const asli = target.replace(/\.js$/, '.asli.js');
        renameSync(target, asli);
        const stub = {
          'selalu valid': '({ valid: true, errors: [] })',
          'selalu ditolak': "({ valid: false, errors: [{ field: 'stub', code: 'STUB' }] })",
        };
        for (const [nama, isi] of Object.entries(stub)) {
          writeFileSync(target, `export * from './${path.basename(asli)}';\nexport const ${fungsi} = () => ${isi};\n`);
          if (jalankanTest(salinan, fileTest).fail > 0) tertangkap += 1;
          else catatan.push(`test tetap lulus walau fungsi diganti versi "${nama}"`);
        }
      }
    } finally {
      rmSync(salinan, { recursive: true, force: true });
    }
  }
  beri('4. Test menangkap fungsi salah', `${tertangkap} dari 2 versi salah`, tertangkap * 5, 10);
}

// 5. Test dulu di riwayat Git (10)
{
  const commitPertama = (rel) => git('log', '--diff-filter=A', '--format=%H', '--reverse', '--', rel).out.split('\n')[0] || null;
  const cTest = fileTest ? commitPertama(fileTest) : null;
  const cModul = modul ? commitPertama(modul) : null;
  let poin = 0;
  let hasil = 'belum di-commit';
  if (cTest && cModul) {
    const bersih = git('status', '--porcelain', '--', fileTest, modul).out === '';
    const testDulu = cTest !== cModul && git('merge-base', '--is-ancestor', cTest, cModul).ok
      && !git('cat-file', '-e', `${cTest}:./${modul}`).ok;
    poin = (bersih ? 4 : 0) + (testDulu ? 6 : 0);
    hasil = testDulu ? 'test lebih dulu' : 'urutan salah';
    if (!bersih) catatan.push('modul atau test masih punya perubahan yang belum di-commit');
    if (!testDulu) catatan.push('commit test harus dibuat sebelum file modul ada (commit terpisah)');
  } else if (cTest) {
    hasil = 'baru test';
    catatan.push('modul belum di-commit');
  } else catatan.push('test dan modul belum di-commit di repo ini');
  beri('5. Test dulu di riwayat Git', hasil, poin, 10);
}

// 6. Log approval Lab (10)
{
  const baris = baca('review/log-approval.md').split(/\r?\n/)
    .filter((b) => b.trim().startsWith('|'))
    .map((b) => b.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim()));
  const lengkap = baris.filter((c) => c[0]?.toLowerCase() === 'lab' && c.length >= 6
    && c.slice(1, 6).every((v) => v !== '') && /^(yes|no)\b/i.test(c[3])).length;
  beri('6. Log approval baris "Lab"', `${lengkap} baris lengkap`, Math.round((10 * Math.min(lengkap, 3)) / 3), 10);
  if (lengkap < 3) catatan.push('log approval: butuh min. 3 baris "Lab" dengan semua kolom terisi, Keputusan diawali Yes atau No');
}

// 7. Aman (5): dinilai hanya kalau modul tim sudah ada.
{
  let poin = 0;
  const lolos = [];
  if (modul && ada(modul)) {
    const lacak = git('ls-files');
    const envTerlacak = lacak.out.split('\n').some((f) => /(^|\/)\.env(\.(?!example$)[\w.-]+)?$/.test(f));
    if (lacak.ok && lacak.out && !envTerlacak) { poin += 2; lolos.push('.env'); }
    else catatan.push('aman: .env ikut dilacak Git, atau folder ini belum punya commit');
    let pkg = {};
    try { pkg = JSON.parse(baca('package.json')); } catch { pkg = null; }
    if (pkg && !Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length) { poin += 1; lolos.push('dependency'); }
    else catatan.push('aman: package.json berisi dependency baru');
    const rahasia = [
      /\b(password|passwd|secret|token|api[_-]?key)\b["']?\s*[:=]\s*["'](?!ISI_)[^"'\s]{6,}["']/i,
      /^\s*[A-Z0-9_]*(PASSWORD|SECRET|TOKEN|API_KEY)\s*=\s*(?!ISI_)\S{6,}/m,
      /\bsk-[A-Za-z0-9_-]{16,}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    ];
    const diperiksa = ['challenge/lab.json', filePrompt, modul, fileTest, 'review/log-approval.md'].filter(ada);
    const kena = diperiksa.filter((f) => rahasia.some((re) => re.test(baca(f))));
    if (!kena.length) { poin += 2; lolos.push('secret'); }
    else catatan.push(`aman: pola kredensial ditemukan di ${kena.join(', ')}`);
  }
  beri('7. Aman: .env, dependency, secret', `${lolos.length} dari 3 cek`, poin, 5);
}

const total = rows.reduce((n, r) => n + r.poin, 0);
const garis = '-'.repeat(68);
console.log(`Cek Lab Sesi 24 - tim ${terisi(lab.tim) ? lab.tim : '(belum diisi)'} · fitur ${terisi(lab.fitur) ? lab.fitur : '(belum diisi)'}`);
console.log(`${'Kriteria'.padEnd(35)}${'Hasil'.padEnd(23)}Poin`);
console.log(garis);
for (const r of rows) {
  console.log(`${r.kriteria.padEnd(35)}${r.hasil.padEnd(23)}${String(r.poin).padStart(3)} / ${String(r.maks).padStart(2)}`);
}
console.log(garis);
console.log(`${'Subtotal otomatis'.padEnd(58)}${String(total).padStart(3)} / 80`);
console.log('Manual (20 poin): review diff 10, aturan bisnis 5, prompt dan data simulasi 5.');
if (catatan.length) {
  console.log('\nYang perlu diperbaiki:');
  for (const c of catatan.slice(0, 12)) console.log(`  - ${c}`);
  if (catatan.length > 12) console.log(`  - ... dan ${catatan.length - 12} lagi`);
}
