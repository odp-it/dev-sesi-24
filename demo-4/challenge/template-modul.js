// Template modul fitur ALP tim. Salin ke path "modul" di challenge/lab.json SETELAH test di-commit.
// Bentuk hasil sama dengan src/validator.js: { valid, errors: [{ field, code }] }.

export function ISI_NAMA_FUNGSI(input) {
  const errors = [];

  // TODO: satu pemeriksaan per aturan bisnis. Contoh bentuk:
  // if (kondisi_tidak_terpenuhi) errors.push({ field: 'ISI_FIELD', code: 'ISI_KODE_ERROR' });

  return { valid: errors.length === 0, errors };
}
