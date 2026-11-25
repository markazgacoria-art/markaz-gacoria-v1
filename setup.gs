/**
 * ================================================================================
 * DOGO STUDIO V1 (v1.0 - PRODUCTION EDITION)
 * Single Source of Truth Database Engine
 * Platform: Google Apps Script + Google Sheets API Cloud
 * ================================================================================
 */

/**
 * Inisialisasi Database Bersih DoGo Studio V1 (8 Tab Sheet Resmi)
 * Menyiapkan sheet, header warna dark emerald, frozen rows, dan sample initial data.
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  setupSheet_(ss, 'DataChannel', [
    'ID_Channel', 'Logo_URL', 'Nama_Channel', 'Link_YouTube', 'Subscribers',
    'Jam_Tayang', 'Pengelola', 'Kategori', 'Niche', 'Status_Channel',
    'Monetisasi', 'Jam_Publish', 'Tanggal_Next_Upload', 'Folder_Drive_ID',
    'Aset_Visual_URL', 'Aset_Audio_URL', 'Aset_Thumbnail_URL', 'Judul_Default',
    'Deskripsi_Default', 'Riwayat_Pendapatan_JSON', 'Email_ID', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataEmail', [
    'ID_Email', 'Alamat_Email', 'Password', 'Kunci_2FA', 'Nomor_Pemulihan',
    'Email_Pemulihan', 'Kode_Cadangan', 'Pemilik', 'Catatan', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataAdSense', [
    'ID_Record', 'ID_AdSense_Google', 'Email_AdSense', 'Password', 'Kunci_2FA',
    'Email_Pemulihan', 'Nomor_Pemulihan', 'Nama_Sesuai_KTP', 'Nama_Bank',
    'Nomor_Rekening', 'Nama_di_Rekening', 'Status_PIN', 'Status_Verifikasi',
    'Foto_KTP_URL', 'Folder_Drive_ID', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataUsers', [
    'User_ID', 'Nama_Lengkap_KTP', 'NIK', 'Nomor_WhatsApp', 'Alamat_Domisili',
    'Email_Login', 'Password', 'Role', 'Foto_Profil_URL', 'Foto_KTP_URL',
    'Nama_Bank', 'Nomor_Rekening', 'Nama_di_Rekening', 'Tanggal_Bergabung',
    'Status_Akun', 'Salah_Password_Count', 'Izin_Akses_JSON', 'Last_Login', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataKeuangan', [
    'ID_Transaksi', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Nominal',
    'Bukti_Nota_URL', 'Foto_Barang_URL', 'Dicatat_Oleh', 'Tanggal_Input', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataKategoriKeuangan', [
    'ID_Kategori', 'Nama_Kategori', 'Tipe', 'Dibuat_Oleh'
  ]);

  setupSheet_(ss, 'DataMateri', [
    'ID_Materi', 'Judul_Materi', 'Kategori', 'Link_Video', 'Deskripsi', 'Tanggal_Rilis', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataTools', [
    'ID_Tool', 'Nama_Tool', 'Kategori', 'Tipe_Peluncuran', 'URL_Tool', 'Deskripsi', 'Ikon', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'LogAktivitas', [
    'ID_Log', 'Waktu', 'Aksi', 'Target', 'Keterangan', 'Dilakukan_Oleh'
  ]);

  setupSheet_(ss, 'DataDropdownMaster', [
    'Kategori_Channel', 'Niche_Channel'
  ]);

  setupSheet_(ss, 'DataLaporanKerja', [
    'ID_Laporan', 'Tanggal_WIB', 'Waktu_WIB', 'ID_User', 'Nama_User',
    'Email_User', 'Kategori_Tugas', 'Channel_Terkait', 'Keterangan',
    'Sumber_Pencatatan', 'Ref_ID', 'Status_Hapus'
  ]);

  setupSheet_(ss, 'DataRekapHarian', [
    'ID_Rekap', 'Tanggal_Laporan', 'Waktu_Kumpul_WIB', 'Total_Staf_Aktif',
    'Total_Staf_Melapor', 'Total_Aktivitas', 'Ringkasan_JSON', 'Status_Kirim_Email'
  ]);

  // Seed default super admin jika DataUsers kosong
  seedDefaultAdmin_(ss);

  // Seed default kategori keuangan jika kosong
  seedDefaultFinanceCategories_(ss);

  // Seed default tools & materi sampel
  seedDefaultToolsAndMateri_(ss);

  // Seed default dropdown master jika kosong
  seedDefaultDropdowns_(ss);

  SpreadsheetApp.flush();
  if (typeof Logger !== 'undefined' && Logger.log) Logger.log('Inisialisasi DoGo Studio V1 Database selesai.');
}

function setupSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  var isNew = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    isNew = true;
  }
  var hasHeader = !isNew && sheet.getLastRow() >= 1 && !!sheet.getRange(1, 1).getDisplayValue();
  if (isNew || !hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#064e3b')
      .setFontColor('#34d399')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function seedDefaultAdmin_(ss) {
  var sheet = ss.getSheetByName('DataUsers');
  if (sheet && sheet.getLastRow() <= 1) {
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var generatedInitPass = 'DgAdm!' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    var defaultPass = (typeof hashPasswordSHA256 === 'function') ? hashPasswordSHA256(generatedInitPass) : generatedInitPass;
    var defaultAdmin = [
      'USR-0001',
      'Owner Studio',
      '3171012345670001',
      '081234567890',
      'Studio Headquarter Jakarta',
      'markazyoutuber.official@gmail.com',
      defaultPass,
      'SUPER_ADMIN',
      '',
      '',
      'BCA',
      '1234567890',
      'Owner Studio',
      nowStr,
      'Aktif',
      0,
      '{"modules":{"channel":true,"email":true,"finance":true,"jadwal":true},"actions":{"add":true,"edit":true,"delete":true},"allMateri":true,"allTools":true,"timCanViewFinance":true,"timCanViewAdSense":true}',
      nowStr,
      'Active'
    ];
    sheet.appendRow(defaultAdmin);
    if (typeof Logger !== 'undefined' && Logger.log) {
      Logger.log('Default Owner seeded (markazyoutuber.official@gmail.com). Initial random password generated (use Google Sign-In or reset OTP).');
    }
  }
}

function seedDefaultFinanceCategories_(ss) {
  var sheet = ss.getSheetByName('DataKategoriKeuangan');
  if (sheet && sheet.getLastRow() <= 1) {
    var defaults = [
      ['CAT-001', 'AdSense YouTube', 'Pemasukan', 'System'],
      ['CAT-002', 'Sponsorship & Endorsement', 'Pemasukan', 'System'],
      ['CAT-003', 'Gaji & Fee Tim', 'Pengeluaran', 'System'],
      ['CAT-004', 'Aset & Alat Studio', 'Pengeluaran', 'System'],
      ['CAT-005', 'Operasional & Listrik', 'Pengeluaran', 'System'],
      ['CAT-006', 'Software & AI Tools', 'Pengeluaran', 'System']
    ];
    sheet.getRange(2, 1, defaults.length, 4).setValues(defaults);
  }
}

function seedDefaultToolsAndMateri_(ss) {
  var tSheet = ss.getSheetByName('DataTools');
  if (tSheet && tSheet.getLastRow() <= 1) {
    var tools = [
      ['TOL-0001', 'Gemini Visual Canvas', 'AI Visual', 'InApp', 'https://gemini.google.com', 'Generator visual & prompt canvas visual studio in-app', 'fa-solid fa-wand-magic-sparkles', 'Active'],
      ['TOL-0002', 'Gemini Metadata Canvas', 'SEO & Metadata', 'InApp', 'https://gemini.google.com', 'Generator metadata judul dan deskripsi video in-app', 'fa-solid fa-tags', 'Active'],
      ['TOL-0003', 'YouTube Studio', 'Platform', 'ExternalWeb', 'https://studio.youtube.com', 'Portal analitik dan pengelolaan channel resmi YouTube', 'fa-brands fa-youtube', 'Active'],
      ['TOL-0004', 'ChatGPT OpenAI', 'AI Text', 'ExternalWeb', 'https://chatgpt.com', 'AI Scriptwriter dan perumus konsep video', 'fa-solid fa-brain', 'Active'],
      ['TOL-0005', 'Canva Pro Studio', 'Design', 'ExternalWeb', 'https://www.canva.com', 'Desain thumbnail dan banner channel beresolusi tinggi', 'fa-solid fa-palette', 'Active'],
      ['TOL-0006', 'CapCut Desktop Installer', 'Software', 'Download', 'https://www.capcut.com', 'Installer software editing video PC resmi', 'fa-solid fa-download', 'Active']
    ];
    tSheet.getRange(2, 1, tools.length, 8).setValues(tools);
  }

  var mSheet = ss.getSheetByName('DataMateri');
  if (mSheet && mSheet.getLastRow() <= 1) {
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy');
    var materi = [
      ['MAT-0001', 'SOP Produksi Konten DoGo Studio', 'SOP Studio', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Panduan alur kerja dari riset judul hingga upload', nowStr, 'Active'],
      ['MAT-0002', 'Teknik Bikin Thumbnail CTR 15%+', 'Thumbnail', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Komposisi warna, lighting, dan ekspresi thumbnail viral', nowStr, 'Active'],
      ['MAT-0003', 'Riset Niche High RPM YouTube', 'SEO & Judul', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Mencari kata kunci yang dicari audiens luar negeri', nowStr, 'Active']
    ];
    mSheet.getRange(2, 1, materi.length, 7).setValues(materi);
  }
}

function seedDefaultDropdowns_(ss) {
  var sheet = ss.getSheetByName('DataDropdownMaster');
  if (sheet && sheet.getLastRow() <= 1) {
    var kategoris = ['Long-Form', 'Shorts', 'Hiburan', 'Edukasi', 'Vlogging', 'Musik', 'Berita', 'Teknologi', 'Gaming', 'Kuliner'];
    var niches = ['Ternak', 'Gaming', 'Keuangan', 'Teknologi', 'Kuliner', 'Otomotif', 'Tutorial', 'Fakta Menarik', 'Horor & Konspirasi', 'Kesehatan'];
    var maxLen = Math.max(kategoris.length, niches.length);
    var rows = [];
    for (var i = 0; i < maxLen; i++) {
      rows.push([kategoris[i] || '', niches[i] || '']);
    }
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}
