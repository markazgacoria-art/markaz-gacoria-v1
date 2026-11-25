/**
 * ================================================================================
 * DOGO STUDIO V1 (v1.0 - PRODUCTION EDITION)
 * Master Backend Business Logic & Multi-Module Controller
 * Engine: ZettBOT Core v4.1 by Zettbos
 * Single Source of Truth: PRD REV-10.0 (Living Context)
 * ================================================================================
 */

// 8 Tab Sheet Resmi DoGo Studio V1
var SHEET_CHANNEL = 'DataChannel';
var SHEET_EMAIL = 'DataEmail';
var SHEET_ADSENSE = 'DataAdSense';
var SHEET_USERS = 'DataUsers';
var SHEET_KEUANGAN = 'DataKeuangan';
var SHEET_KATEGORI_KEUANGAN = 'DataKategoriKeuangan';
var SHEET_MATERI = 'DataMateri';
var SHEET_TOOLS = 'DataTools';
var SHEET_LOG = 'LogAktivitas';
var SHEET_DROPDOWN_MASTER = 'DataDropdownMaster';
var SHEET_LAPORAN_KERJA = 'DataLaporanKerja';
var SHEET_REKAP_HARIAN = 'DataRekapHarian';

var COL_LAPORAN = {
  ID: 0,
  TANGGAL_WIB: 1,
  WAKTU_WIB: 2,
  USER_ID: 3,
  NAMA_USER: 4,
  EMAIL_USER: 5,
  KATEGORI: 6,
  CHANNEL: 7,
  KETERANGAN: 8,
  SUMBER: 9,
  REF_ID: 10,
  STATUS_HAPUS: 11
};

var COL_REKAP = {
  ID: 0,
  TANGGAL: 1,
  WAKTU_KUMPUL: 2,
  TOTAL_STAF_AKTIF: 3,
  TOTAL_STAF_MELAPOR: 4,
  TOTAL_AKTIVITAS: 5,
  RINGKASAN_JSON: 6,
  STATUS_EMAIL: 7
};

var WORK_REPORT_CATEGORIES = [
  'Buat Email',
  'Buat Channel',
  'Cari / Buat Bahan',
  'Mengedit',
  'Upload',
  'Menjadwalkan'
];

/**
 * ================================================================================
 * 🌐 WEB APP ROUTING
 * ================================================================================
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return doPost(e);
  }
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('DoGo Studio V1 - YouTube Content Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function doPost(e) {
  try {
    var rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    var request = {};
    if (rawData) {
      try {
        request = JSON.parse(rawData);
      } catch (err) {
        request = {};
      }
    }
    var action = request.action || (e && e.parameter && e.parameter.action) || '';
    var args = Array.isArray(request.args) ? request.args : (request.payload !== undefined ? [request.payload] : []);
    
    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'DoGo Studio API Gateway Online',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Whitelist keamanan: Hanya fungsi publik yang tidak berakhiran underscore '_' dan bukan fungsi sistem routing
    if (!action || typeof action !== 'string' || action.endsWith('_') || action === 'doGet' || action === 'doPost' || action === 'include') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Aksi API tidak valid atau privat: ' + action
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var fn = this[action];
    if (typeof fn !== 'function') {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Fungsi backend tidak ditemukan: ' + action
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var result = fn.apply(this, args);
    return ContentService.createTextOutput(JSON.stringify(result !== undefined ? result : { success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (ex) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server Error: ' + ex.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Helper Resolvers untuk Sheet Database Resmi
 */
function getSS_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheetByName_(name) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

function getChannelSheet_() { return getSheetByName_(SHEET_CHANNEL); }
function getEmailSheet_() { return getSheetByName_(SHEET_EMAIL); }
function getAdSenseSheet_() { return getSheetByName_(SHEET_ADSENSE); }
function getUserSheet_() { return getSheetByName_(SHEET_USERS); }
function getFinanceSheet_() { return getSheetByName_(SHEET_KEUANGAN); }
function getKategoriFinanceSheet_() { return getSheetByName_(SHEET_KATEGORI_KEUANGAN); }
function getMateriSheet_() { return getSheetByName_(SHEET_MATERI); }
function getToolsSheet_() { return getSheetByName_(SHEET_TOOLS); }
function getLogSheet_() { return getSheetByName_(SHEET_LOG); }
function getDropdownMasterSheet_() { return getSheetByName_(SHEET_DROPDOWN_MASTER); }
function getWorkSheetSafe_(name, headers) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    if (typeof setupDatabase === 'function') {
      setupDatabase();
      sheet = ss.getSheetByName(name);
    }
    if (!sheet && ss && typeof ss.insertSheet === 'function') {
      sheet = ss.insertSheet(name);
      if (sheet && headers && headers.length) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }
  }
  return sheet;
}
function getLaporanKerjaSheet_() {
  return getWorkSheetSafe_(SHEET_LAPORAN_KERJA, [
    'ID_Laporan', 'Tanggal_WIB', 'Waktu_WIB', 'ID_User', 'Nama_User',
    'Email_User', 'Kategori_Tugas', 'Channel_Terkait', 'Keterangan',
    'Sumber_Pencatatan', 'Ref_ID', 'Status_Hapus'
  ]);
}
function getRekapHarianSheet_() {
  return getWorkSheetSafe_(SHEET_REKAP_HARIAN, [
    'ID_Rekap', 'Tanggal_Laporan', 'Waktu_Kumpul_WIB', 'Total_Staf_Aktif',
    'Total_Staf_Melapor', 'Total_Aktivitas', 'Ringkasan_JSON', 'Status_Kirim_Email'
  ]);
}

/**
 * ================================================================================
 * 🔐 SECURITY CORE: CRYPTO HASHING, SERVER-SIDE SESSION TOKEN & RBAC GUARD
 * ================================================================================
 */
function sha256Hex_(str) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, (str || '').toString(), Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < rawHash.length; i++) {
    var b = (rawHash[i] < 0) ? (rawHash[i] + 256) : rawHash[i];
    hex += ('0' + b.toString(16)).slice(-2);
  }
  return hex;
}

function constantTimeEquals_(a, b) {
  var sa = (a || '').toString();
  var sb = (b || '').toString();
  if (sa.length !== sb.length) return false;
  var diff = 0;
  for (var i = 0; i < sa.length; i++) {
    diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return diff === 0;
}

function hashPasswordSHA256(plainPassword) {
  var salt = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  var digest = sha256Hex_(salt + ':' + (plainPassword || '').toString());
  return 'sha256$' + salt + '$' + digest;
}

function verifyUserPassword_(plainInput, storedPass, sheet, rowNum) {
  var inp = (plainInput || '').toString();
  var stored = (storedPass || '').toString();
  if (!inp || !stored) return false;

  if (stored.indexOf('sha256$') === 0) {
    var parts = stored.split('$');
    if (parts.length !== 3) return false;
    var candidate = sha256Hex_(parts[1] + ':' + inp);
    return constantTimeEquals_(candidate, parts[2]);
  }

  // Kompatibilitas akun legacy plaintext: verifikasi lalu auto-migrasi ke SHA-256 salted
  if (constantTimeEquals_(stored, inp)) {
    try {
      if (sheet && rowNum >= 2) {
        sheet.getRange(rowNum, 7).setValue(hashPasswordSHA256(inp));
        SpreadsheetApp.flush();
      }
    } catch (e) {}
    return true;
  }
  return false;
}

function normalizeUserPermsObj_(izinJson) {
  var userPerms = {
    scope: 'mine',
    sensitive: {
      viewCredentials: true,
      viewKtp: false,
      exportFinance: true
    },
    matrix: {
      dashboard: { view: true },
      jadwal:    { view: true,  edit: true },
      channel:   { view: true,  add: true,  edit: true,  delete: false },
      email:     { view: true,  add: true,  edit: true,  delete: false },
      laporan:   { view: true,  add: true,  delete: false },
      finance:   { view: false, add: false, edit: false, delete: false },
      materi:    { view: true,  add: false, delete: false },
      tools:     { view: true,  add: false, delete: false },
      adsense:   { view: false, add: false, edit: false, delete: false },
      users:     { view: false, edit: false, delete: false },
      logs:      { view: false },
      trash:     { view: false, edit: false, delete: false }
    },
    modules: {
      dashboard: true,
      channel: true,
      email: true,
      laporan: true,
      finance: false,
      jadwal: true,
      materi: true,
      tools: true,
      adsense: false,
      users: false,
      logs: false,
      trash: false
    },
    actions: {
      add: true,
      edit: true,
      delete: false
    },
    timCanViewChannels: true,
    timCanViewEmails: true,
    timCanViewFinance: false,
    timCanViewJadwal: true,
    timCanViewAdSense: false,
    timCanAddChannels: true,
    timCanEditChannels: true,
    timCanDeleteChannels: false,
    allMateri: true,
    allowedMateriIds: [],
    allTools: true,
    allowedToolIds: []
  };

  if (izinJson) {
    try {
      var customP = (typeof izinJson === 'string') ? JSON.parse(izinJson) : izinJson;
      if (customP && typeof customP === 'object') {
        if (customP.scope === 'all' || customP.scope === 'mine') {
          userPerms.scope = customP.scope;
        }
        if (customP.sensitive && typeof customP.sensitive === 'object') {
          if (customP.sensitive.viewCredentials !== undefined) userPerms.sensitive.viewCredentials = !!customP.sensitive.viewCredentials;
          if (customP.sensitive.viewKtp !== undefined) userPerms.sensitive.viewKtp = !!customP.sensitive.viewKtp;
          if (customP.sensitive.exportFinance !== undefined) userPerms.sensitive.exportFinance = !!customP.sensitive.exportFinance;
        }

        if (customP.actions && typeof customP.actions === 'object') {
          userPerms.actions = Object.assign({}, userPerms.actions, customP.actions);
        }
        if (customP.timCanAddChannels !== undefined && (!customP.actions || customP.actions.add === undefined)) {
          userPerms.actions.add = !!customP.timCanAddChannels;
        }
        if (customP.timCanEditChannels !== undefined && (!customP.actions || customP.actions.edit === undefined)) {
          userPerms.actions.edit = !!customP.timCanEditChannels;
        }
        if (customP.timCanDeleteChannels !== undefined && (!customP.actions || customP.actions.delete === undefined)) {
          userPerms.actions.delete = !!customP.timCanDeleteChannels;
        }

        if (customP.modules && typeof customP.modules === 'object') {
          userPerms.modules = Object.assign({}, userPerms.modules, customP.modules);
        }
        if (customP.timCanViewChannels !== undefined && (!customP.modules || customP.modules.channel === undefined)) {
          userPerms.modules.channel = !!customP.timCanViewChannels;
        }
        if (customP.timCanViewEmails !== undefined && (!customP.modules || customP.modules.email === undefined)) {
          userPerms.modules.email = !!customP.timCanViewEmails;
        }
        if (customP.timCanViewFinance !== undefined && (!customP.modules || customP.modules.finance === undefined)) {
          userPerms.modules.finance = !!customP.timCanViewFinance;
        }
        if (customP.timCanViewJadwal !== undefined && (!customP.modules || customP.modules.jadwal === undefined)) {
          userPerms.modules.jadwal = !!customP.timCanViewJadwal;
        }
        if (customP.timCanViewAdSense !== undefined && (!customP.modules || customP.modules.adsense === undefined)) {
          userPerms.modules.adsense = !!customP.timCanViewAdSense;
        }

        if (customP.matrix && typeof customP.matrix === 'object') {
          var modKeys = Object.keys(userPerms.matrix);
          for (var i = 0; i < modKeys.length; i++) {
            var mk = modKeys[i];
            if (customP.matrix[mk] && typeof customP.matrix[mk] === 'object') {
              var mergedRow = Object.assign({}, userPerms.matrix[mk], customP.matrix[mk]);
              mergedRow.view = !!mergedRow.view;
              if (!mergedRow.view) {
                if ('add' in mergedRow) mergedRow.add = false;
                if ('edit' in mergedRow) mergedRow.edit = false;
                if ('delete' in mergedRow) mergedRow.delete = false;
              } else {
                if ('add' in mergedRow) mergedRow.add = !!mergedRow.add;
                if ('edit' in mergedRow) mergedRow.edit = !!mergedRow.edit;
                if ('delete' in mergedRow) mergedRow.delete = !!mergedRow.delete;
              }
              userPerms.matrix[mk] = mergedRow;
            }
          }
        } else {
          // Bangun matrix secara otomatis dari format JSON v1 agar 100% kompatibel mundur
          userPerms.matrix.dashboard.view = !!userPerms.modules.dashboard;
          userPerms.matrix.jadwal = {
            view: !!userPerms.modules.jadwal,
            edit: !!userPerms.modules.jadwal && !!userPerms.actions.edit
          };
          userPerms.matrix.channel = {
            view: !!userPerms.modules.channel,
            add: !!userPerms.modules.channel && !!userPerms.actions.add,
            edit: !!userPerms.modules.channel && !!userPerms.actions.edit,
            delete: !!userPerms.modules.channel && !!userPerms.actions.delete
          };
          userPerms.matrix.email = {
            view: !!userPerms.modules.email,
            add: !!userPerms.modules.email && !!userPerms.actions.add,
            edit: !!userPerms.modules.email && !!userPerms.actions.edit,
            delete: !!userPerms.modules.email && !!userPerms.actions.delete
          };
          userPerms.matrix.finance = {
            view: !!userPerms.modules.finance,
            add: !!userPerms.modules.finance && !!userPerms.actions.add,
            edit: !!userPerms.modules.finance && !!userPerms.actions.edit,
            delete: !!userPerms.modules.finance && !!userPerms.actions.delete
          };
          userPerms.matrix.materi = {
            view: !!userPerms.modules.materi,
            add: false,
            delete: false
          };
          userPerms.matrix.tools = {
            view: !!userPerms.modules.tools,
            add: false,
            delete: false
          };
          userPerms.matrix.adsense = {
            view: !!userPerms.modules.adsense,
            add: false,
            edit: false,
            delete: false
          };
          userPerms.matrix.users = {
            view: !!userPerms.modules.users,
            edit: false,
            delete: false
          };
          userPerms.matrix.logs = { view: !!userPerms.modules.logs };
          userPerms.matrix.trash = { view: !!userPerms.modules.trash, edit: false, delete: false };
          userPerms.matrix.laporan = {
            view: userPerms.modules.laporan !== false,
            add: userPerms.modules.laporan !== false,
            delete: false
          };
        }

        // Jika matrix v2 diberikan tanpa properti actions eksplisit, hitung ringkasan actions dari matrix resource studio (kecuali laporan)
        if (customP.matrix && (!customP.actions || typeof customP.actions !== 'object')) {
          var anyAdd = false, anyEdit = false, anyDelete = false;
          var sumKeys = Object.keys(userPerms.matrix);
          for (var si = 0; si < sumKeys.length; si++) {
            var mkKey = sumKeys[si];
            if (mkKey === 'laporan') continue;
            var sm = userPerms.matrix[mkKey];
            if (sm && sm.view) {
              if (sm.add) anyAdd = true;
              if (sm.edit) anyEdit = true;
              if (sm.delete) anyDelete = true;
            }
          }
          userPerms.actions = { add: anyAdd, edit: anyEdit, delete: anyDelete };
        }

        // Default aman untuk data sensitif jika scope='all' tanpa blok sensitive eksplisit
        if (userPerms.scope === 'all' && (!customP.sensitive || customP.sensitive.viewCredentials === undefined)) {
          userPerms.sensitive.viewCredentials = false;
        }

        // Sinkronkan modules & alias agar pemeriksaan lama tetap valid
        var allKeys = Object.keys(userPerms.matrix);
        for (var k = 0; k < allKeys.length; k++) {
          var modName = allKeys[k];
          userPerms.modules[modName] = !!userPerms.matrix[modName].view;
        }
        userPerms.timCanViewChannels = !!userPerms.matrix.channel.view;
        userPerms.timCanViewEmails = !!userPerms.matrix.email.view;
        userPerms.timCanViewFinance = !!userPerms.matrix.finance.view;
        userPerms.timCanViewJadwal = !!userPerms.matrix.jadwal.view;
        userPerms.timCanViewAdSense = !!userPerms.matrix.adsense.view;
        userPerms.timCanAddChannels = !!userPerms.actions.add;
        userPerms.timCanEditChannels = !!userPerms.actions.edit;
        userPerms.timCanDeleteChannels = !!userPerms.actions.delete;

        if (customP.allMateri !== undefined) userPerms.allMateri = !!customP.allMateri;
        if (Array.isArray(customP.allowedMateriIds)) userPerms.allowedMateriIds = customP.allowedMateriIds;
        if (customP.allTools !== undefined) userPerms.allTools = !!customP.allTools;
        if (Array.isArray(customP.allowedToolIds)) userPerms.allowedToolIds = customP.allowedToolIds;
      }
    } catch (e) {}
  }
  return userPerms;
}

var _REQUEST_AUTH_CACHE_ = {};

function clearAuthMemoryCache_() {
  _REQUEST_AUTH_CACHE_ = {};
}

function createServerSession_(email, userId) {
  var cleanEmail = (email || '').toString().trim().toLowerCase();
  var token = Utilities.getUuid() + '-' + sha256Hex_(Utilities.getUuid() + ':' + cleanEmail + ':' + Date.now()).slice(0, 16);
  var now = Date.now();
  var sessObj = {
    e: cleanEmail,
    u: userId || '',
    c: now,
    x: now + (6 * 60 * 60 * 1000) // Berlaku 6 jam
  };
  var jsonStr = JSON.stringify(sessObj);

  try {
    CacheService.getScriptCache().put('SESS_' + token, jsonStr, 21600);
  } catch (e) {}

  try {
    var props = PropertiesService.getScriptProperties();
    var allProps = props.getProperties();
    var sessKeys = [];
    for (var k in allProps) {
      if (k.indexOf('SESS_') === 0) {
        try {
          var p = JSON.parse(allProps[k]);
          if (!p || !p.x || p.x < now) props.deleteProperty(k);
          else sessKeys.push({ k: k, c: p.c || 0 });
        } catch (errP) {
          props.deleteProperty(k);
        }
      }
    }
    if (sessKeys.length > 40) {
      sessKeys.sort(function(a, b) { return a.c - b.c; });
      for (var j = 0; j < sessKeys.length - 40; j++) {
        props.deleteProperty(sessKeys[j].k);
      }
    }
    props.setProperty('SESS_' + token, jsonStr);
  } catch (e) {}

  return token;
}

function destroyServerSession_(userSession) {
  try {
    clearAuthMemoryCache_();
    var token = (userSession && userSession.token) ? userSession.token.toString().trim() : '';
    if (!token) return;
    try { CacheService.getScriptCache().remove('SESS_' + token); } catch (e) {}
    try { PropertiesService.getScriptProperties().deleteProperty('SESS_' + token); } catch (e) {}
  } catch (e) {}
}

function revokeAllSessionsForEmail_(email) {
  try {
    clearAuthMemoryCache_();
    var cleanEmail = (email || '').toString().trim().toLowerCase();
    if (!cleanEmail) return;
    var ts = String(Date.now());
    try { CacheService.getScriptCache().put('REVOKED_' + cleanEmail, ts, 21600); } catch (e) {}
    try {
      var props = PropertiesService.getScriptProperties();
      var allProps = props.getProperties();
      for (var k in allProps) {
        if (k.indexOf('SESS_') === 0) {
          try {
            var p = JSON.parse(allProps[k]);
            if (p && p.e === cleanEmail) props.deleteProperty(k);
          } catch (errP) {}
        }
      }
    } catch (e) {}
  } catch (e) {}
}

function authenticateSession(clientSession) {
  if (!clientSession || typeof clientSession !== 'object') return null;

  // STRICT ZERO-TRUST TOKEN VALIDATION (REV-10.21):
  // Abaikan total properti _serverVerified, role, email, atau izinAkses kiriman klien.
  // Validasi mutlak hanya berdasar token acak yang terdaftar di CacheService server!
  var token = (clientSession.token || '').toString().trim();
  if (!token || token.length < 20) return null;

  var memHit = _REQUEST_AUTH_CACHE_[token];
  if (memHit && memHit.user && (Date.now() - memHit.ts) < 800) {
    return memHit.user;
  }

  var raw = null;
  var fromCache = false;
  try {
    raw = CacheService.getScriptCache().get('SESS_' + token);
    if (raw) fromCache = true;
  } catch (e) {}
  if (!raw) {
    try { raw = PropertiesService.getScriptProperties().getProperty('SESS_' + token); } catch (e) {}
  }
  if (!raw) return null;

  var sessMeta = null;
  try { sessMeta = JSON.parse(raw); } catch (e) { return null; }
  if (!sessMeta || !sessMeta.e || (sessMeta.x && Date.now() > sessMeta.x)) return null;

  // Cek pencabutan paksa sesi (ganti password / freeze / delete)
  try {
    var revRaw = CacheService.getScriptCache().get('REVOKED_' + sessMeta.e);
    if (revRaw && sessMeta.c && sessMeta.c < parseInt(revRaw, 10)) {
      return null;
    }
  } catch (e) {}

  // Hangatkan kembali CacheService jika terhapus lebih awal oleh eviction kuota
  if (!fromCache && sessMeta.x) {
    try {
      var remainSec = Math.max(60, Math.min(21600, Math.floor((sessMeta.x - Date.now()) / 1000)));
      CacheService.getScriptCache().put('SESS_' + token, raw, remainSec);
    } catch (e) {}
  }

  // Selalu baca identitas, role, status, & izin terbaru langsung dari DataUsers
  var sheet = getUserSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var email = (r[5] || '').toString().trim().toLowerCase();
    if (email === sessMeta.e) {
      var statusAkun = (r[14] || 'Aktif').toString().trim();
      var stNorm = statusAkun.toLowerCase();
      var statusHapus = (r[18] || 'Active').toString().trim().toLowerCase();

      if (statusHapus === 'deleted') return null;
      if (stNorm === 'pending' || stNorm === 'pending approval') return null;
      if (stNorm === 'dibekukan' || stNorm === 'frozen' || stNorm === 'locked') return null;

      var roleRaw = (r[7] || 'Pengguna').toString().trim().toUpperCase();
      var cleanRole = roleRaw.replace(/[\s_]/g, '');
      var normalizedRole = (cleanRole === 'SUPERADMIN' || cleanRole === 'OWNER' || cleanRole === 'SUPER' || cleanRole === 'ADMIN') ? 'SUPER_ADMIN' : 'TIM';
      var userPerms = normalizeUserPermsObj_((r[16] || '{}').toString().trim());

      var verifiedObj = {
        token: token,
        id: r[0],
        userId: r[0],
        nama: (r[1] || '').toString().trim() || email,
        nik: (r[2] || '').toString().trim(),
        noWa: r[3] || '',
        alamat: r[4] || '',
        email: email,
        role: normalizedRole,
        displayRole: r[7] || 'Pengguna',
        fotoProfil: r[8] || '',
        fotoKtpUrl: r[9] || '',
        namaBank: r[10] || '',
        bank: r[10] || '',
        noRekening: r[11] || '',
        atasNama: r[12] || '',
        status: statusAkun,
        izinAkses: userPerms
      };
      _REQUEST_AUTH_CACHE_[token] = { ts: Date.now(), user: verifiedObj };
      return verifiedObj;
    }
  }
  return null;
}

/**
 * Helper Pemeriksaan Role Super Admin (Wajib Sesi Terverifikasi Server)
 */
function isSuperAdmin(userSession) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  var role = (verified.role || '').toString().toUpperCase().replace(/[\s_]/g, '');
  return role === 'SUPERADMIN' || role === 'OWNER' || role === 'SUPER' || role === 'ADMIN';
}

/**
 * Helper Verifikasi Cakupan Data Global vs Milik Sendiri (REV-10.19)
 */
function hasGlobalScope(userSession) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  var perms = verified.izinAkses || {};
  return perms.scope === 'all';
}

/**
 * Helper Verifikasi Izin Data Sensitif (viewCredentials / viewKtp / exportFinance)
 */
function canViewSensitive(userSession, kind) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  var perms = verified.izinAkses || {};
  var sens = perms.sensitive || {};
  if (kind === 'credentials') {
    if (sens.viewCredentials !== undefined) return !!sens.viewCredentials;
    return perms.scope !== 'all';
  }
  if (kind === 'ktp') {
    return !!sens.viewKtp;
  }
  if (kind === 'exportFinance') {
    return sens.exportFinance !== undefined ? !!sens.exportFinance : canAccessFinance(verified);
  }
  return false;
}

/**
 * Helper Verifikasi Izin Modul Keuangan Studio (Strict Whitelist + Token Check)
 */
function canAccessFinance(userSession) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  var perms = verified.izinAkses || {};
  if (perms.matrix && perms.matrix.finance && perms.matrix.finance.view !== undefined) {
    return !!perms.matrix.finance.view;
  }
  if (perms.modules && perms.modules.finance !== undefined) {
    return !!perms.modules.finance;
  }
  if (perms.timCanViewFinance !== undefined) {
    return !!perms.timCanViewFinance;
  }
  return false;
}

/**
 * Helper Verifikasi Izin Modul Umum (REV-10.19 Mendukung Seluruh 11 Modul + Admin Read-Only)
 */
function canAccessModule(userSession, moduleName) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  var perms = verified.izinAkses || {};
  if (moduleName === 'finance') return canAccessFinance(verified);
  if (perms.matrix && perms.matrix[moduleName] && perms.matrix[moduleName].view !== undefined) {
    return !!perms.matrix[moduleName].view;
  }
  if (perms.modules && perms.modules[moduleName] !== undefined) {
    return !!perms.modules[moduleName];
  }
  if (moduleName === 'channel' && perms.timCanViewChannels !== undefined) return !!perms.timCanViewChannels;
  if (moduleName === 'email' && perms.timCanViewEmails !== undefined) return !!perms.timCanViewEmails;
  if (moduleName === 'jadwal' && perms.timCanViewJadwal !== undefined) return !!perms.timCanViewJadwal;
  if (moduleName === 'adsense' && perms.timCanViewAdSense !== undefined) return !!perms.timCanViewAdSense;

  // Modul admin & sensitif WAJIB tertutup secara default kecuali diizinkan eksplisit
  if (moduleName === 'adsense' || moduleName === 'users' || moduleName === 'logs' || moduleName === 'trash' || moduleName === 'finance') {
    return false;
  }
  if (moduleName === 'dashboard' || moduleName === 'materi' || moduleName === 'tools' || moduleName === 'channel' || moduleName === 'email' || moduleName === 'jadwal' || moduleName === 'laporan') {
    return true;
  }
  return false;
}

/**
 * Helper Verifikasi Izin Tindakan Operasional Per-Modul (add / edit / delete) - REV-10.19
 */
function canPerformModuleAction(userSession, moduleName, actionName) {
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  if (!canAccessModule(verified, moduleName)) return false;

  var perms = verified.izinAkses || {};
  if (perms.matrix && perms.matrix[moduleName] && perms.matrix[moduleName][actionName] !== undefined) {
    return !!perms.matrix[moduleName][actionName];
  }
  if (moduleName === 'laporan') {
    return actionName === 'add';
  }
  // Fallback kompatibilitas format v1 hanya untuk modul operasional standar (bukan admin/materi/tools)
  if (moduleName === 'adsense' || moduleName === 'users' || moduleName === 'logs' || moduleName === 'trash' || moduleName === 'materi' || moduleName === 'tools') {
    return false;
  }
  return canPerformAction(verified, actionName);
}

/**
 * Helper Verifikasi Izin Tindakan Operasional (mendukung opsional moduleName)
 */
function canPerformAction(userSession, actionName, moduleName) {
  if (moduleName) {
    return canPerformModuleAction(userSession, moduleName, actionName);
  }
  var verified = authenticateSession(userSession);
  if (!verified) return false;
  if (isSuperAdmin(verified)) return true;
  var perms = verified.izinAkses || {};
  if (perms.actions && perms.actions[actionName] !== undefined) {
    return !!perms.actions[actionName];
  }
  if (actionName === 'add' && perms.timCanAddChannels !== undefined) return !!perms.timCanAddChannels;
  if (actionName === 'edit' && perms.timCanEditChannels !== undefined) return !!perms.timCanEditChannels;
  if (actionName === 'delete' && perms.timCanDeleteChannels !== undefined) return !!perms.timCanDeleteChannels;
  return actionName !== 'delete';
}

/**
 * Pencatat Aktivitas Sistem (Audit Log Anti-Tabrakan)
 */
function logActivity_(aksi, target, keterangan, userSession) {
  try {
    var sheet = getLogSheet_();
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var actor = (userSession && (userSession.nama || userSession.email)) || 'System';
    var idLog = generateId_('LOG', sheet);
    sheet.appendRow([idLog, nowStr, aksi, target, keterangan, actor]);
  } catch (e) {
    Logger.log('logActivity error: ' + e.message);
  }
}

/**
 * Generator ID Sekuensial Berbasis LockService (Anti-Tabrakan & MAX + 1)
 */
function generateId_(prefix, sheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ym = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMM');
    var lastRow = sheet.getLastRow();
    var maxNum = 0;
    if (lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        var val = ids[i][0] || '';
        var match = val.match(/(\d+)$/);
        if (match) {
          var n = parseInt(match[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
    }
    var nextNum = maxNum + 1;
    return prefix + '-' + ym + '-' + ('000' + nextNum).slice(-3);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ================================================================================
 * 🔐 MODUL 1: AUTENTIKASI PENGGUNA & PROTOKOL KEAMANAN
 * ================================================================================
 */

function loginUser(credentials) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
    credentials = credentials || {};
    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, message: 'Database user masih kosong.' };
    }

    var userInput = (credentials.email || '').toString().trim().toLowerCase();
    var passInput = (credentials.password || '').toString().trim();
    if (!userInput || !passInput) {
      return { success: false, message: 'Email dan kata sandi wajib diisi.' };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var statusHapus = (r[18] || 'Active').toString().trim().toLowerCase();
      if (statusHapus === 'deleted') continue;

      var email = (r[5] || '').toString().trim().toLowerCase(); // Email_Login
      var pass = (r[6] || '').toString().trim();               // Password
      var nama = (r[1] || '').toString().trim();               // Nama_Lengkap_KTP
      var role = (r[7] || 'Pengguna').toString().trim().toUpperCase(); // Role
      var statusAkun = (r[14] || 'Aktif').toString().trim();   // Status_Akun
      var failCount = parseInt((r[15] || '0').toString().replace(/[^0-9]/g, ''), 10) || 0; // Salah_Password_Count
      var izinJson = (r[16] || '{}').toString().trim();        // Izin_Akses_JSON

      var matchUser = (email === userInput) || (nama.toLowerCase() === userInput);
      if (matchUser) {
        var stNorm = statusAkun.toLowerCase();

        // 1. Cek Status Akun: Pending Approval Gate
        if (stNorm === 'pending' || stNorm === 'pending approval') {
          return {
            success: false,
            message: 'Akun Anda masih berstatus PENDING APPROVAL. Silakan hubungi Admin untuk persetujuan akun sebelum dapat masuk.'
          };
        }

        // 2. Cek Status Akun: Dibekukan (Frozen)
        if (stNorm === 'dibekukan' || stNorm === 'frozen' || stNorm === 'locked') {
          return {
            success: false,
            message: 'Akun Anda telah DIBEKUKAN oleh sistem karena 5x salah kata sandi. Silakan hubungi Super Admin untuk membuka blokir.'
          };
        }

        // 3. Verifikasi Password (SHA-256 salted + auto-migrasi legacy plaintext)
        if (verifyUserPassword_(passInput, pass, sheet, i + 2)) {
          sheet.getRange(i + 2, 16).setValue(0);
          var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
          sheet.getRange(i + 2, 18).setValue(nowStr); // Last_Login
          SpreadsheetApp.flush();

          var cleanRole = role.replace(/[\s_]/g, '');
          var normalizedRole = (cleanRole === 'SUPERADMIN' || cleanRole === 'OWNER' || cleanRole === 'SUPER' || cleanRole === 'ADMIN') ? 'SUPER_ADMIN' : 'TIM';
          var userPerms = normalizeUserPermsObj_(izinJson);
          var sessionToken = createServerSession_(email, r[0]);

          var sessionUser = {
            token: sessionToken,
            id: r[0],
            userId: r[0],
            nama: nama || email,
            nik: (r[2] || '').toString().trim(),
            noWa: r[3] || '',
            alamat: r[4] || '',
            email: email,
            role: normalizedRole,
            displayRole: r[7] || 'Pengguna',
            fotoProfil: r[8] || '',
            fotoKtpUrl: r[9] || '',
            namaBank: r[10] || '',
            bank: r[10] || '',
            noRekening: r[11] || '',
            atasNama: r[12] || '',
            status: statusAkun,
            izinAkses: userPerms
          };

          logActivity_('Login Berhasil', email, 'Masuk ke studio (' + normalizedRole + ')', sessionUser);

          return {
            success: true,
            user: sessionUser,
            userSession: sessionUser,
            permissions: userPerms
          };
        } else {
          // 4. Password Salah -> Increment Counter Brute Force
          failCount++;
          sheet.getRange(i + 2, 16).setValue(failCount);

          if (failCount >= 5) {
            sheet.getRange(i + 2, 15).setValue('Dibekukan');
            SpreadsheetApp.flush();
            revokeAllSessionsForEmail_(email);
            logActivity_('Akun Dibekukan', email, 'Akun dibekukan otomatis karena 5x salah password berturut-turut.', null);
            return {
              success: false,
              message: 'Akun Anda telah DIBEKUKAN karena 5 kali berturut-turut salah memasukkan kata sandi! Hubungi Super Admin untuk membuka blokir.'
            };
          } else {
            SpreadsheetApp.flush();
            return {
              success: false,
              message: 'Kata sandi salah! Sisa percobaan: ' + (5 - failCount) + ' kali sebelum akun dibekukan.'
            };
          }
        }
      }
    }

    return { success: false, message: 'Email atau username tidak terdaftar!' };
  } catch (err) {
    return { success: false, message: 'Gagal login: ' + err.message };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * ================================================================================
 * 🔐 GOOGLE SIGN-IN (OAUTH 2.0 / GIS) CREDENTIAL HANDLER
 * ================================================================================
 */
function decodeGoogleJwtPayload_(jwtString) {
  if (!jwtString || typeof jwtString !== 'string') return null;
  var parts = jwtString.split('.');
  if (parts.length < 2) return null;
  try {
    var b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var decoded = Utilities.newBlob(Utilities.base64Decode(b64)).getDataAsString('UTF-8');
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

function loginWithGoogle(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
    payload = payload || {};
    var credential = (payload.credential || payload.idToken || '').toString().trim();
    if (!credential) {
      return { success: false, message: 'Kredensial token Google tidak ditemukan.' };
    }

    var tokenData = decodeGoogleJwtPayload_(credential);
    if (!tokenData || !tokenData.email) {
      return { success: false, message: 'Token Google tidak valid atau format tidak sesuai.' };
    }

    var cleanEmail = (tokenData.email || '').toString().trim().toLowerCase();
    var googleName = (tokenData.name || cleanEmail.split('@')[0]).toString().trim();
    var googlePicture = (tokenData.picture || '').toString().trim();
    var isVerified = (tokenData.email_verified === true || tokenData.email_verified === 'true');

    if (!isVerified) {
      return { success: false, message: 'Email Google Anda belum terverifikasi oleh Google.' };
    }

    var expectedClientId = '224443808801-cc7qfebil8jipnt4p1806vau8rabv302.apps.googleusercontent.com';
    if (tokenData.aud && tokenData.aud !== expectedClientId) {
      return { success: false, message: 'Client ID token Google tidak sesuai dengan DoGo Studio.' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');

    if (lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
      for (var i = 0; i < data.length; i++) {
        var r = data[i];
        var statusHapus = (r[18] || 'Active').toString().trim().toLowerCase();
        if (statusHapus === 'deleted') continue;

        var emailInSheet = (r[5] || '').toString().trim().toLowerCase();
        if (emailInSheet === cleanEmail) {
          var role = (r[7] || 'Pengguna').toString().trim().toUpperCase();
          var statusAkun = (r[14] || 'Aktif').toString().trim();
          var stNorm = statusAkun.toLowerCase();

          // 1. Cek Akun Dibekukan
          if (stNorm === 'dibekukan' || stNorm === 'frozen' || stNorm === 'locked') {
            return {
              success: false,
              message: 'Akun Anda telah DIBEKUKAN oleh sistem. Hubungi Super Admin untuk membuka blokir.'
            };
          }

          // 2. Cek Akun Pending (Kecuali Super Admin / Owner)
          var isOwner = (cleanEmail === 'markazyoutuber.official@gmail.com') || (role.indexOf('ADMIN') !== -1) || (role.indexOf('OWNER') !== -1);
          if (!isOwner && (stNorm === 'pending' || stNorm === 'pending approval')) {
            return {
              success: false,
              message: 'Akun Anda masih berstatus PENDING APPROVAL. Silakan hubungi Super Admin untuk persetujuan akun.'
            };
          }

          // Reset fail count, perbarui last login & foto profil jika kosong
          sheet.getRange(i + 2, 16).setValue(0);
          sheet.getRange(i + 2, 18).setValue(nowStr);
          if (googlePicture && !r[8]) {
            sheet.getRange(i + 2, 9).setValue(googlePicture);
          }
          SpreadsheetApp.flush();

          var cleanRole = role.replace(/[\s_]/g, '');
          var normalizedRole = (cleanRole === 'SUPERADMIN' || cleanRole === 'OWNER' || cleanRole === 'SUPER' || cleanRole === 'ADMIN') ? 'SUPER_ADMIN' : 'TIM';
          var izinJson = (r[16] || '{}').toString().trim();
          var userPerms = normalizeUserPermsObj_(izinJson);
          var sessionToken = createServerSession_(cleanEmail, r[0]);

          var sessionUser = {
            token: sessionToken,
            id: r[0],
            userId: r[0],
            nama: r[1] || googleName,
            nik: (r[2] || '').toString().trim(),
            noWa: r[3] || '',
            alamat: r[4] || '',
            email: cleanEmail,
            role: normalizedRole,
            displayRole: r[7] || 'Pengguna',
            fotoProfil: r[8] || googlePicture,
            fotoKtpUrl: r[9] || '',
            namaBank: r[10] || '',
            bank: r[10] || '',
            noRekening: r[11] || '',
            atasNama: r[12] || '',
            status: statusAkun,
            izinAkses: userPerms,
            authProvider: 'google'
          };

          logActivity_('Login Google Berhasil', cleanEmail, 'Masuk via Google Sign-In (' + normalizedRole + ')', sessionUser);

          return {
            success: true,
            user: sessionUser,
            userSession: sessionUser,
            permissions: userPerms
          };
        }
      }
    }

    // Akun belum terdaftar -> Registrasi Baru Otomatis via Google
    var newUserId = generateId_('USR');
    var isFirstOwner = (cleanEmail === 'markazyoutuber.official@gmail.com') || (lastRow <= 1);
    var assignedRole = isFirstOwner ? 'Super Admin' : 'Pengguna';
    var assignedStatus = isFirstOwner ? 'Aktif' : 'Pending Approval';
    var defaultPerms = normalizeUserPermsObj_('{}');

    var newRow = [
      newUserId,
      googleName,
      '', // NIK
      '', // No WhatsApp
      '', // Alamat
      cleanEmail,
      hashPasswordSHA256(Utilities.getUuid()), // Sandi aman acak
      assignedRole,
      googlePicture, // Foto Profil dari Google
      '', // Foto KTP URL
      '', // Nama Bank
      '', // No Rekening
      '', // Atas Nama
      nowStr, // Created_At
      assignedStatus, // Status_Akun
      0, // Salah_Password_Count
      JSON.stringify(defaultPerms), // Izin_Akses_JSON
      nowStr, // Last_Login
      'Active' // Status_Hapus
    ];

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();

    logActivity_('Registrasi Google', cleanEmail, 'Mendaftar via Google Sign-In (' + assignedRole + ')', null);

    if (assignedStatus === 'Aktif') {
      var normRole = isFirstOwner ? 'SUPER_ADMIN' : 'TIM';
      var sessToken = createServerSession_(cleanEmail, newUserId);
      var newSessionUser = {
        token: sessToken,
        id: newUserId,
        userId: newUserId,
        nama: googleName,
        nik: '',
        noWa: '',
        alamat: '',
        email: cleanEmail,
        role: normRole,
        displayRole: assignedRole,
        fotoProfil: googlePicture,
        fotoKtpUrl: '',
        namaBank: '',
        bank: '',
        noRekening: '',
        atasNama: '',
        status: assignedStatus,
        izinAkses: defaultPerms,
        authProvider: 'google'
      };

      return {
        success: true,
        user: newSessionUser,
        userSession: newSessionUser,
        permissions: defaultPerms
      };
    } else {
      return {
        success: false,
        pendingApproval: true,
        message: 'Pendaftaran via akun Google berhasil! Akun Anda sedang menunggu persetujuan Super Admin.'
      };
    }
  } catch (err) {
    return { success: false, message: 'Google Sign-In Error: ' + err.message };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function logoutUser(userSession) {
  try {
    var verified = authenticateSession(userSession);
    if (verified) {
      logActivity_('Logout', verified.email, 'Keluar dari sistem', verified);
    }
    destroyServerSession_(userSession);
    return { success: true };
  } catch (err) {
    return { success: true };
  }
}

function registerUser_(payload) {
  try {
    payload = payload || {};
    var email = (payload.email || '').toString().trim().toLowerCase();
    var pass = (payload.password || '').toString().trim();
    var nama = (payload.nama || '').toString().trim();
    var nik = '';
    var noWa = (payload.noWa || '').toString().trim();
    var alamat = (payload.alamat || '').toString().trim();

    if (!email || !pass || !nama) {
      return { success: false, message: 'Nama Lengkap, Email, dan Password wajib diisi!' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Format alamat email tidak valid!' };
    }
    if (nama.length < 2) {
      return { success: false, message: 'Nama lengkap minimal 2 karakter!' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter!' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
      for (var i = 0; i < existingData.length; i++) {
        var exEmail = (existingData[i][0] || '').toString().trim().toLowerCase();
        var exDeleted = (existingData[i][13] || 'Active').toString().trim().toLowerCase();
        if (exDeleted !== 'deleted' && exEmail === email) {
          return { success: false, message: 'Email sudah terdaftar! Silakan login.' };
        }
      }
    }

    var newId = generateId_('USR', sheet);
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var hashedPass = hashPasswordSHA256(pass);
    var defaultPerms = '{"modules":{"channel":true,"email":true,"finance":false,"jadwal":true},"actions":{"add":true,"edit":true,"delete":false},"allMateri":true,"allowedMateriIds":[],"allTools":true,"allowedToolIds":[]}';

    var row = [
      newId,
      nama,
      nik,
      noWa,
      alamat,
      email,
      hashedPass,
      'Pengguna',
      '',
      '',
      '',
      '',
      nama,
      nowStr,
      'Pending Approval',
      0,
      defaultPerms,
      '-',
      'Active'
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();
    logActivity_('Registrasi Baru', email, 'Pengguna mendaftar (Pending Approval): ' + nama + ' (' + email + ')', null);

    return {
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (Pending Approval) dari Admin. Silakan hubungi Admin untuk aktivasi.'
    };
  } catch (err) {
    return { success: false, message: 'Gagal registrasi: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🚀 ARSITEKTUR GO-PUBLIC: VERIFIKASI PENDAFTARAN WAJIB EMAIL ASLI (REV-10.17)
 * ================================================================================
 */

/**
 * Step 1 Registrasi Publik: Validasi Data, Simpan di Cache, & Kirim OTP ke Email Asli
 */
function requestRegistrationOtp(payload) {
  try {
    payload = payload || {};
    var email = (payload.email || '').toString().trim().toLowerCase();
    var pass = (payload.password || '').toString().trim();
    var nama = (payload.nama || '').toString().trim();
    var noWa = (payload.noWa || '').toString().trim();
    var alamat = (payload.alamat || '').toString().trim();
    var nik = (payload.nik || '').toString().trim();

    if (!email || !pass || !nama) {
      return { success: false, message: 'Nama Lengkap, Email Asli, dan Password wajib diisi!' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Format alamat email tidak valid! Wajib gunakan email asli yang aktif.' };
    }
    if (nama.length < 2) {
      return { success: false, message: 'Nama lengkap minimal 2 karakter!' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter!' };
    }

    var _sha256 = (typeof sha256Hex_ === 'function') ? sha256Hex_ : sha256Hex;
    var _getUserSheet = (typeof getUserSheet_ === 'function') ? getUserSheet_ : getUserSheet;
    var _logAct = (typeof logActivity_ === 'function') ? logActivity_ : logActivity;

    var cache = CacheService.getScriptCache();
    var cooldownKey = 'REG_CD_' + _sha256(email).slice(0, 20);
    if (cache.get(cooldownKey)) {
      return { success: false, message: 'Tunggu 60 detik sebelum meminta kode OTP verifikasi pendaftaran baru.' };
    }

    // Pastikan email belum terdaftar di DataUsers
    var sheet = _getUserSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
      for (var i = 0; i < existingData.length; i++) {
        var exEmail = (existingData[i][0] || '').toString().trim().toLowerCase();
        var exDeleted = (existingData[i][13] || 'Active').toString().trim().toLowerCase();
        if (exDeleted !== 'deleted' && exEmail === email) {
          return { success: false, message: 'Email ini sudah terdaftar dalam sistem! Silakan langsung login.' };
        }
      }
    }

    var otpCode = String(Math.floor(100000 + Math.random() * 900000));
    var pendingKey = 'REG_PENDING_' + _sha256(email).slice(0, 24);
    var hashedPass = hashPasswordSHA256(pass);

    var pendingData = {
      nama: nama,
      nik: nik,
      noWa: noWa,
      alamat: alamat,
      email: email,
      hashedPass: hashedPass,
      otpHash: _sha256(email + ':REG:' + otpCode),
      attempts: 0
    };

    try {
      MailApp.sendEmail({
        to: email,
        subject: '[DoGo Studio V1] Kode Verifikasi Pendaftaran Akun Baru',
        htmlBody: '<div style="font-family:sans-serif;padding:24px;background:#07120b;color:#f1f5f9;border-radius:12px;max-width:550px;border:1px solid rgba(0,230,118,0.25);">' +
          '<h2 style="color:#00e676;margin-top:0;">DoGo Studio V1 - Verifikasi Akun Baru</h2>' +
          '<p>Halo <strong>' + nama + '</strong>,</p>' +
          '<p>Terima kasih telah mendaftar di DoGo Studio V1. Untuk memverifikasi bahwa ini adalah alamat email asli Anda yang aktif, gunakan kode OTP 6-digit berikut (berlaku 15 menit):</p>' +
          '<div style="font-size:32px;font-weight:900;letter-spacing:6px;color:#00e676;background:#0a1710;padding:14px 24px;border-radius:8px;display:inline-block;border:1px solid #00e676;margin:12px 0;">' + otpCode + '</div>' +
          '<p style="font-size:12px;color:#94a3b8;margin-top:16px;">Jangan berikan kode verifikasi ini kepada siapa pun. Jika Anda tidak merasa mendaftar di DoGo Studio, abaikan email ini.</p>' +
          '</div>'
      });
    } catch (mailErr) {
      _logAct('OTP Reg Gagal Kirim', email, 'Gagal kirim email OTP pendaftaran: ' + mailErr.message, null);
      return { success: false, message: 'Gagal mengirim email OTP ke ' + email + '. Pastikan alamat email aktif dan dapat menerima email. Rincian: ' + mailErr.message };
    }

    cache.put(pendingKey, JSON.stringify(pendingData), 900); // 15 menit
    cache.put(cooldownKey, '1', 60); // Cooldown 60 detik
    _logAct('Permintaan OTP Registrasi', email, 'Kode OTP verifikasi akun baru dikirim ke email', null);

    return {
      success: true,
      message: 'Kode OTP verifikasi 6 digit telah dikirim ke ' + email + '. Silakan periksa Kotak Masuk atau folder Spam.'
    };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan sistem saat meminta OTP pendaftaran: ' + e.message };
  }
}

/**
 * Step 2 Registrasi Publik: Verifikasi Kode OTP & Simpan Akun Baru ke DataUsers
 */
function confirmRegistrationWithOtp(payload) {
  try {
    payload = payload || {};
    var email = (payload.email || '').toString().trim().toLowerCase();
    var otp = (payload.otp || '').toString().trim();

    if (!email || !otp) {
      return { success: false, message: 'Alamat email dan kode OTP wajib diisi!' };
    }
    if (otp.length !== 6) {
      return { success: false, message: 'Kode OTP harus berupa 6 digit angka.' };
    }

    var _sha256 = (typeof sha256Hex_ === 'function') ? sha256Hex_ : sha256Hex;
    var _getUserSheet = (typeof getUserSheet_ === 'function') ? getUserSheet_ : getUserSheet;
    var _logAct = (typeof logActivity_ === 'function') ? logActivity_ : logActivity;
    var _genId = (typeof generateId_ === 'function') ? generateId_ : generateId;

    var cache = CacheService.getScriptCache();
    var pendingKey = 'REG_PENDING_' + _sha256(email).slice(0, 24);
    var rawPending = cache.get(pendingKey);
    if (!rawPending) {
      return { success: false, message: 'Sesi verifikasi pendaftaran telah kedaluwarsa atau tidak ditemukan. Silakan kirim ulang formulir pendaftaran.' };
    }

    var pendingData;
    try {
      pendingData = JSON.parse(rawPending);
    } catch (e) {
      cache.remove(pendingKey);
      return { success: false, message: 'Data sesi pendaftaran rusak. Silakan daftar ulang.' };
    }

    pendingData.attempts = (pendingData.attempts || 0) + 1;
    if (pendingData.attempts > 5) {
      cache.remove(pendingKey);
      _logAct('OTP Reg Lockout', email, 'Sesi pendaftaran dibatalkan karena 5x salah OTP berturut-turut', null);
      return { success: false, message: 'Terlalu banyak percobaan kode OTP yang salah (maks 5x). Sesi pendaftaran dibatalkan demi keamanan. Silakan daftar ulang.' };
    }

    var expectedHash = _sha256(email + ':REG:' + otp);
    if (pendingData.otpHash !== expectedHash) {
      var sisa = 5 - pendingData.attempts;
      cache.put(pendingKey, JSON.stringify(pendingData), 900);
      return { success: false, message: 'Kode OTP salah. Sisa kesempatan mencoba: ' + sisa + ' kali.' };
    }

    // OTP Valid! Simpan akun ke Google Sheet DataUsers
    var sheet = _getUserSheet();
    var lastRow = sheet.getLastRow();

    // Cek ulang keunikan email untuk hindari race condition
    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
      for (var i = 0; i < existingData.length; i++) {
        var exEmail = (existingData[i][0] || '').toString().trim().toLowerCase();
        var exDeleted = (existingData[i][13] || 'Active').toString().trim().toLowerCase();
        if (exDeleted !== 'deleted' && exEmail === email) {
          cache.remove(pendingKey);
          return { success: false, message: 'Email ini sudah terdaftar dalam sistem!' };
        }
      }
    }

    var newId = _genId('USR', sheet);
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var defaultPerms = '{"modules":{"channel":true,"email":true,"finance":false,"jadwal":true},"actions":{"add":true,"edit":true,"delete":false},"allMateri":true,"allowedMateriIds":[],"allTools":true,"allowedToolIds":[]}';

    var row = [
      newId,
      pendingData.nama,
      pendingData.nik,
      pendingData.noWa,
      pendingData.alamat,
      email,
      pendingData.hashedPass,
      'Pengguna',
      '',
      '',
      '',
      '',
      pendingData.nama,
      nowStr,
      'Pending Approval',
      0,
      defaultPerms,
      '-',
      'Active'
    ];

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    cache.remove(pendingKey);
    cache.remove('REG_CD_' + _sha256(email).slice(0, 20));

    _logAct('Registrasi Terverifikasi', email, 'Pengguna baru berhasil diverifikasi OTP email dan terdaftar (Pending Approval): ' + pendingData.nama + ' (' + email + ')', null);

    return {
      success: true,
      message: 'Selamat! Email Anda berhasil diverifikasi. Pendaftaran akun Anda telah kami terima dan menunggu persetujuan (Approval) dari Admin.'
    };
  } catch (err) {
    return { success: false, message: 'Gagal menyelesaikan verifikasi pendaftaran: ' + err.message };
  }
}

/**
 * Step 1 Lupa Sandi Aman: Kirim OTP 6-Digit ke Email Terdaftar
 */
function requestPasswordResetOtp(payload) {
  try {
    payload = payload || {};
    var email = (payload.email || '').toString().trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Masukkan alamat email akun yang valid.' };
    }

    var cache = CacheService.getScriptCache();
    var cooldownKey = 'OTP_CD_' + sha256Hex_(email).slice(0, 20);
    if (cache.get(cooldownKey)) {
      return { success: false, message: 'Tunggu 60 detik sebelum meminta kode OTP baru.' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
    var foundUser = null;
    for (var i = 0; i < data.length; i++) {
      var stHapus = (data[i][18] || 'Active').toString().trim().toLowerCase();
      if (stHapus === 'deleted') continue;
      if ((data[i][5] || '').toString().trim().toLowerCase() === email) {
        foundUser = data[i];
        break;
      }
    }

    if (!foundUser) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem.' };
    }

    var stNorm = (foundUser[14] || '').toString().trim().toLowerCase();
    if (stNorm === 'dibekukan' || stNorm === 'frozen' || stNorm === 'locked') {
      return { success: false, message: 'Akun Anda sedang DIBEKUKAN sistem karena 5x salah sandi. Reset mandiri ditolak; silakan hubungi Super Admin untuk membuka blokir.' };
    }
    if (stNorm === 'pending' || stNorm === 'pending approval') {
      return { success: false, message: 'Akun masih berstatus Pending Approval. Hubungi Admin untuk aktivasi terlebih dahulu.' };
    }

    var otpCode = String(Math.floor(100000 + Math.random() * 900000));
    var otpKey = 'OTP_RESET_' + sha256Hex_(email).slice(0, 24);
    var otpData = {
      hash: sha256Hex_(email + ':' + otpCode),
      attempts: 0
    };

    try {
      MailApp.sendEmail({
        to: email,
        subject: '[DoGo Studio V1] Kode Verifikasi OTP Reset Kata Sandi',
        htmlBody: '<div style="font-family:sans-serif;padding:20px;background:#07120b;color:#f1f5f9;border-radius:12px;">' +
          '<h2 style="color:#00e676;margin-top:0;">DoGo Studio V1 - Verifikasi Reset Sandi</h2>' +
          '<p>Halo <strong>' + (foundUser[1] || email) + '</strong>,</p>' +
          '<p>Kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda. Gunakan kode OTP 6-digit berikut (berlaku 10 menit):</p>' +
          '<div style="font-size:28px;font-weight:900;letter-spacing:6px;color:#00e676;background:#0a1710;padding:14px 20px;border-radius:8px;display:inline-block;border:1px solid #00e676;">' + otpCode + '</div>' +
          '<p style="font-size:12px;color:#94a3b8;margin-top:16px;">Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak merasa meminta reset sandi, abaikan email ini.</p>' +
          '</div>'
      });
    } catch (mailErr) {
      logActivity_('OTP Gagal Kirim', email, 'Gagal mengirim email OTP: ' + mailErr.message, null);
      return { success: false, message: 'Layanan email OTP belum aktif/gagal mengirim ke ' + email + '. Silakan minta Super Admin mereset sandi Anda via Database Pengguna.' };
    }

    cache.put(otpKey, JSON.stringify(otpData), 600); // 10 menit
    cache.put(cooldownKey, '1', 60); // Cooldown 60 detik
    logActivity_('Permintaan OTP Reset', email, 'Kode OTP reset sandi dikirim ke email', null);
    return { success: true, message: 'Kode OTP 6-digit telah dikirim ke ' + email + '. Silakan cek kotak masuk / folder spam.' };
  } catch (err) {
    return { success: false, message: 'Gagal memproses OTP: ' + err.message };
  }
}

/**
 * Step 2 Lupa Sandi Aman: Verifikasi OTP & Simpan Kata Sandi Baru Ter-Hash
 */
function confirmPasswordResetWithOtp(payload) {
  try {
    payload = payload || {};
    var email = (payload.email || '').toString().trim().toLowerCase();
    var otp = (payload.otp || '').toString().trim();
    var newPass = (payload.newPassword || '').toString().trim();

    if (!email || !otp || !newPass) {
      return { success: false, message: 'Email, kode OTP, dan kata sandi baru wajib diisi!' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter!' };
    }

    var cache = CacheService.getScriptCache();
    var otpKey = 'OTP_RESET_' + sha256Hex_(email).slice(0, 24);
    var rawOtp = cache.get(otpKey);
    if (!rawOtp) {
      return { success: false, message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta ulang OTP.' };
    }

    var otpObj = JSON.parse(rawOtp);
    var expectedHash = sha256Hex_(email + ':' + otp);
    if (!constantTimeEquals_(expectedHash, otpObj.hash)) {
      otpObj.attempts = (otpObj.attempts || 0) + 1;
      if (otpObj.attempts >= 5) {
        cache.remove(otpKey);
        return { success: false, message: 'Terlalu banyak percobaan OTP salah! Kode OTP dibatalkan, silakan minta kode baru.' };
      }
      cache.put(otpKey, JSON.stringify(otpObj), 600);
      return { success: false, message: 'Kode OTP salah! Sisa percobaan: ' + (5 - otpObj.attempts) + ' kali.' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
    for (var i = 0; i < data.length; i++) {
      var stHapus = (data[i][18] || 'Active').toString().trim().toLowerCase();
      if (stHapus === 'deleted') continue;
      if ((data[i][5] || '').toString().trim().toLowerCase() === email) {
        var status = (data[i][14] || '').toString().toLowerCase();
        if (status === 'dibekukan' || status === 'frozen' || status === 'locked') {
          return { success: false, message: 'Akun dibekukan. Reset mandiri ditolak. Hubungi Super Admin!' };
        }
        sheet.getRange(i + 2, 7).setValue(hashPasswordSHA256(newPass));
        sheet.getRange(i + 2, 16).setValue(0);
        SpreadsheetApp.flush();
        cache.remove(otpKey);
        revokeAllSessionsForEmail_(email);
        logActivity_('Reset Password OTP', email, 'Pengguna berhasil mereset password dengan verifikasi OTP.', null);
        return { success: true, message: 'Kata sandi berhasil diperbarui! Silakan login dengan sandi baru.' };
      }
    }
    return { success: false, message: 'Email tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal mereset password: ' + err.message };
  }
}

function requestPasswordReset(payload) {
  return confirmPasswordResetWithOtp(payload);
}

/**
 * ================================================================================
 * 👥 MODUL 7: DATABASE PENGGUNA & ADMIN CONTROL CENTER
 * ================================================================================
 */

function getUsersData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canAccessModule(userSession, 'users')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin melihat Database Pengguna.', data: [] };
    }
    var superUser = isSuperAdmin(userSession);
    var allowKtp = superUser || canViewSensitive(userSession, 'ktp');
    params = params || {};
    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [] };

    var raw = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
    var search = (params.search || '').toString().toLowerCase().trim();
    var statusFilter = (params.status || 'ALL').toString().trim().toLowerCase();

    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var id = r[0];
      var nama = r[1];
      var nik = r[2];
      var noWa = r[3];
      var alamat = r[4];
      var email = r[5];
      var role = r[7];
      var fotoProfil = r[8];
      var fotoKtp = allowKtp ? r[9] : '';
      var bank = r[10];
      var noRek = r[11];
      var atasNama = r[12];
      var status = r[14];
      var salahCount = parseInt(r[15] || '0', 10);
      var izinJson = superUser ? (r[16] || '{}') : '{}';
      var lastLogin = r[17];
      var statusHapus = r[18];

      if (!id && !email) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      if (statusFilter !== 'all' && status.toLowerCase() !== statusFilter) continue;

      if (search) {
        var str = (email + ' ' + nama + ' ' + noWa + ' ' + alamat).toLowerCase();
        if (str.indexOf(search) === -1) continue;
      }

      list.push({
        id: id,
        nama: nama,
        noWa: noWa,
        alamat: alamat,
        email: email,
        role: role,
        fotoProfil: fotoProfil,
        fotoKtpUrl: fotoKtp,
        bank: bank,
        noRekening: noRek,
        atasNama: atasNama,
        status: status,
        salahCount: salahCount,
        izinAkses: izinJson,
        lastLogin: lastLogin || '-'
      });
    }

    return { success: true, data: list, items: list };
  } catch (err) {
    return { success: false, message: 'Gagal memuat pengguna: ' + err.message, data: [] };
  }
}

function approveUser(targetEmail, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canPerformModuleAction(userSession, 'users', 'edit')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin menyetujui akun.' };
    }
    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var data = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
    var tEmail = (targetEmail || '').toString().trim().toLowerCase();

    for (var i = 0; i < data.length; i++) {
      if ((data[i][13] || '').toString().toLowerCase() === 'deleted') continue;
      if ((data[i][0] || '').toString().trim().toLowerCase() === tEmail) {
        sheet.getRange(i + 2, 15).setValue('Aktif');
        sheet.getRange(i + 2, 16).setValue(0);
        SpreadsheetApp.flush();
        clearAuthMemoryCache_();
        logActivity_('Approve Akun', tEmail, 'Akun disetujui oleh Admin: ' + (userSession.nama || userSession.email), userSession);
        return { success: true, message: 'Akun ' + tEmail + ' berhasil disetujui (Aktif)!' };
      }
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menyetujui akun: ' + err.message };
  }
}

function unfreezeUser(targetEmail, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canPerformModuleAction(userSession, 'users', 'edit')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin membuka blokir akun.' };
    }
    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var data = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
    var tEmail = (targetEmail || '').toString().trim().toLowerCase();

    for (var i = 0; i < data.length; i++) {
      if ((data[i][13] || '').toString().toLowerCase() === 'deleted') continue;
      if ((data[i][0] || '').toString().trim().toLowerCase() === tEmail) {
        sheet.getRange(i + 2, 15).setValue('Aktif');
        sheet.getRange(i + 2, 16).setValue(0);
        SpreadsheetApp.flush();
        logActivity_('Buka Blokir Akun', tEmail, 'Blokir akun dibuka oleh Admin', userSession);
        return { success: true, message: 'Blokir akun ' + tEmail + ' berhasil dibuka!' };
      }
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal membuka blokir: ' + err.message };
  }
}

function updateUserPermissions(targetEmail, permissionsObj, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !isSuperAdmin(userSession)) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Hanya Super Admin yang berhak mengatur izin akses.' };
    }
    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var data = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
    var tEmail = (targetEmail || '').toString().trim().toLowerCase();
    var jsonStr = typeof permissionsObj === 'string' ? permissionsObj : JSON.stringify(permissionsObj);

    for (var i = 0; i < data.length; i++) {
      if ((data[i][13] || '').toString().toLowerCase() === 'deleted') continue;
      if ((data[i][0] || '').toString().trim().toLowerCase() === tEmail) {
        sheet.getRange(i + 2, 17).setValue(jsonStr);
        SpreadsheetApp.flush();
        clearAuthMemoryCache_();
        logActivity_('Ubah Izin Akses', tEmail, 'Izin akses diperbarui untuk: ' + tEmail, userSession);
        return { success: true, message: 'Izin akses untuk ' + tEmail + ' berhasil diperbarui!' };
      }
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui izin: ' + err.message };
  }
}

function deleteUser(targetEmail, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canPerformModuleAction(userSession, 'users', 'delete')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin menghapus pengguna.' };
    }
    var superUser = isSuperAdmin(userSession);
    var tEmail = (targetEmail || '').toString().trim().toLowerCase();
    if (tEmail === userSession.email) {
      return { success: false, message: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif!' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database user kosong.' };

    var emails = sheet.getRange(2, 6, lastRow - 1, 3).getDisplayValues();
    for (var i = 0; i < emails.length; i++) {
      if ((emails[i][0] || '').toString().trim().toLowerCase() === tEmail) {
        var targetRoleNorm = (emails[i][2] || '').toString().toUpperCase().replace(/[\s_]/g, '');
        if (!superUser && (targetRoleNorm === 'SUPERADMIN' || targetRoleNorm === 'OWNER' || targetRoleNorm === 'SUPER' || targetRoleNorm === 'ADMIN')) {
          return { success: false, message: 'Akses ditolak: Pengguna non-Super Admin tidak berhak menghapus akun Admin/Super Admin.' };
        }
        sheet.getRange(i + 2, 19).setValue('Deleted');
        SpreadsheetApp.flush();
        revokeAllSessionsForEmail_(tEmail);
        logActivity_('Hapus Pengguna', tEmail, 'Pengguna dipindahkan ke Tong Sampah', userSession);
        return { success: true, message: 'Pengguna ' + tEmail + ' berhasil dipindahkan ke Tong Sampah!' };
      }
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus pengguna: ' + err.message };
  }
}

function updateUserProfile(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canPerformModuleAction(userSession, 'users', 'edit')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin mengubah data pengguna.' };
    }
    var superUser = isSuperAdmin(userSession);
    payload = payload || {};
    var targetEmail = (payload.email || '').toString().trim().toLowerCase();
    if (!targetEmail) {
      return { success: false, message: 'Email pengguna tidak valid.' };
    }

    var sheet = getUserSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database pengguna kosong.' };

    var emails = sheet.getRange(2, 6, lastRow - 1, 14).getDisplayValues();
    var foundRow = -1;
    var existingRole = '';
    for (var i = 0; i < emails.length; i++) {
      if ((emails[i][13] || '').toString().toLowerCase() === 'deleted') continue;
      if ((emails[i][0] || '').toString().trim().toLowerCase() === targetEmail) {
        foundRow = i + 2;
        existingRole = (emails[i][2] || '').toString().trim();
        break;
      }
    }

    if (foundRow === -1) {
      return { success: false, message: 'Pengguna dengan email ' + targetEmail + ' tidak ditemukan.' };
    }

    var existingRoleNorm = existingRole.toUpperCase().replace(/[\s_]/g, '');
    if (!superUser && (existingRoleNorm === 'SUPERADMIN' || existingRoleNorm === 'OWNER' || existingRoleNorm === 'SUPER' || existingRoleNorm === 'ADMIN')) {
      return { success: false, message: 'Akses ditolak: Anda tidak berhak mengubah data akun Admin / Super Admin.' };
    }

    var shouldRevoke = false;

    if (payload.nama !== undefined && payload.nama.toString().trim()) {
      sheet.getRange(foundRow, 2).setValue(payload.nama.toString().trim());
    }
    if (payload.noWa !== undefined) {
      sheet.getRange(foundRow, 4).setValue(payload.noWa.toString().trim());
    }
    if (payload.alamat !== undefined) {
      sheet.getRange(foundRow, 5).setValue(payload.alamat.toString().trim());
    }
    if (payload.newPassword && payload.newPassword.toString().trim().length >= 6) {
      sheet.getRange(foundRow, 7).setValue(hashPasswordSHA256(payload.newPassword.toString().trim()));
      sheet.getRange(foundRow, 16).setValue(0);
      shouldRevoke = true;
    }
    if (payload.role !== undefined && payload.role.toString().trim()) {
      var newRole = payload.role.toString().trim();
      var newRoleNorm = newRole.toUpperCase().replace(/[\s_]/g, '');
      if (!superUser && (newRoleNorm === 'SUPERADMIN' || newRoleNorm === 'OWNER' || newRoleNorm === 'SUPER' || newRoleNorm === 'ADMIN')) {
        return { success: false, message: 'Akses ditolak: Hanya Super Admin yang berhak menetapkan role Admin / Super Admin.' };
      }
      if (superUser) {
        sheet.getRange(foundRow, 8).setValue(newRole);
      }
    }
    if (payload.fotoKtpUrl !== undefined) {
      sheet.getRange(foundRow, 10).setValue(payload.fotoKtpUrl.toString().trim());
    }
    if (payload.bank !== undefined) {
      sheet.getRange(foundRow, 11).setValue(payload.bank.toString().trim());
    }
    if (payload.noRekening !== undefined) {
      sheet.getRange(foundRow, 12).setValue(payload.noRekening.toString().trim());
    }
    if (payload.atasNama !== undefined) {
      sheet.getRange(foundRow, 13).setValue(payload.atasNama.toString().trim());
    }
    if (payload.status !== undefined && payload.status.toString().trim()) {
      var stVal = payload.status.toString().trim();
      sheet.getRange(foundRow, 15).setValue(stVal);
      if (stVal.toLowerCase() === 'aktif') {
        sheet.getRange(foundRow, 16).setValue(0);
      } else {
        shouldRevoke = true;
      }
    }

    SpreadsheetApp.flush();
    clearAuthMemoryCache_();
    if (shouldRevoke && targetEmail !== userSession.email) {
      revokeAllSessionsForEmail_(targetEmail);
    }
    logActivity_('Update Profil Pengguna', targetEmail, 'Data pengguna diperbarui oleh Super Admin', userSession);
    return { success: true, message: 'Data pengguna ' + targetEmail + ' berhasil diperbarui!' };
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui pengguna: ' + err.message };
  }
}

/**
 * Sinkronisasi Sesi Pengguna Real-Time (Verifikasi Token + Fresh Permissions dari DataUsers)
 */
function syncUserSession(userSession) {
  try {
    var auth = authenticateSession(userSession);
    if (!auth) {
      return { success: false, authExpired: true, message: 'Sesi login telah kedaluwarsa atau dicabut. Silakan login kembali.' };
    }
    return { success: true, userSession: auth, permissions: auth.izinAkses };
  } catch (err) {
    return { success: false, message: 'Gagal sinkronisasi sesi: ' + err.message };
  }
}

/**
 * Profil Saya & Ganti Kata Sandi Pribadi Aman (Wajib Verifikasi Sandi Lama)
 */
function updateMyProfileAndPassword(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid. Silakan login ulang.' };
    }
    payload = payload || {};

    var _getUserSheet = (typeof getUserSheet_ === 'function') ? getUserSheet_ : getUserSheet;
    var _verifyPwd = (typeof verifyUserPassword_ === 'function') ? verifyUserPassword_ : verifyUserPassword;
    var _logAct = (typeof logActivity_ === 'function') ? logActivity_ : logActivity;

    var sheet = _getUserSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database pengguna kosong.' };

    var data = sheet.getRange(2, 1, lastRow - 1, 19).getDisplayValues();
    var foundRow = -1;
    var rowData = null;
    for (var i = 0; i < data.length; i++) {
      if ((data[i][18] || '').toString().toLowerCase() === 'deleted') continue;
      if ((data[i][5] || '').toString().trim().toLowerCase() === userSession.email) {
        foundRow = i + 2;
        rowData = data[i];
        break;
      }
    }

    if (foundRow === -1) return { success: false, message: 'Profil akun tidak ditemukan.' };

    var newPass = (payload.newPassword || '').toString().trim();
    var oldPass = (payload.oldPassword || '').toString().trim();

    if (newPass) {
      if (newPass.length < 6) {
        return { success: false, message: 'Kata sandi baru minimal 6 karakter!' };
      }
      if (!oldPass) {
        return { success: false, message: 'Masukkan kata sandi lama Anda untuk mengganti sandi!' };
      }
      if (!_verifyPwd(oldPass, rowData[6], sheet, foundRow)) {
        return { success: false, message: 'Kata sandi lama tidak sesuai!' };
      }
      sheet.getRange(foundRow, 7).setValue(hashPasswordSHA256(newPass));
    }

    if (payload.nama !== undefined && payload.nama.toString().trim()) {
      sheet.getRange(foundRow, 2).setValue(payload.nama.toString().trim());
    }
    if (payload.nik !== undefined) {
      sheet.getRange(foundRow, 3).setValue(payload.nik.toString().trim());
    }
    if (payload.noWa !== undefined) {
      sheet.getRange(foundRow, 4).setValue(payload.noWa.toString().trim());
    }
    if (payload.alamat !== undefined) {
      sheet.getRange(foundRow, 5).setValue(payload.alamat.toString().trim());
    }
    if (payload.fotoKtpUrl !== undefined) {
      sheet.getRange(foundRow, 10).setValue(payload.fotoKtpUrl.toString().trim());
    }
    if (payload.namaBank !== undefined || payload.bank !== undefined) {
      var bVal = (payload.namaBank !== undefined ? payload.namaBank : payload.bank);
      sheet.getRange(foundRow, 11).setValue(bVal.toString().trim());
    }
    if (payload.noRekening !== undefined) {
      sheet.getRange(foundRow, 12).setValue(payload.noRekening.toString().trim());
    }
    if (payload.atasNama !== undefined) {
      sheet.getRange(foundRow, 13).setValue(payload.atasNama.toString().trim());
    }

    SpreadsheetApp.flush();
    if (typeof clearAuthMemoryCache_ === 'function') clearAuthMemoryCache_();
    _logAct('Update Profil Pribadi', userSession.email, newPass ? 'Memperbarui profil dan mengganti kata sandi' : 'Memperbarui profil pribadi', userSession);
    var updatedAuth = authenticateSession(userSession);
    return {
      success: true,
      message: newPass ? 'Profil dan kata sandi berhasil diperbarui!' : 'Profil pribadi berhasil disimpan!',
      userSession: updatedAuth
    };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan profil: ' + err.message };
  }
}

/**
 * Audit Log Viewer (Khusus Super Admin Panel)
 */
function getActivityLogs(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !canAccessModule(userSession, 'logs')) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Anda tidak memiliki izin melihat Log Aktivitas.', data: [] };
    }
    params = params || {};
    var search = (params.search || '').toString().toLowerCase().trim();
    var sheet = getLogSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [], items: [] };

    var raw = sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
    var list = [];
    for (var i = raw.length - 1; i >= 0; i--) {
      var r = raw[i];
      if (!r[0] && !r[2]) continue;
      if (search) {
        var str = (r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + r[3] + ' ' + r[4] + ' ' + r[5]).toLowerCase();
        if (str.indexOf(search) === -1) continue;
      }
      list.push({
        id: r[0],
        waktu: r[1],
        aksi: r[2],
        target: r[3],
        keterangan: r[4],
        pelaku: r[5]
      });
      if (list.length >= 250) break;
    }
    return { success: true, data: list, items: list };
  } catch (err) {
    return { success: false, message: 'Gagal memuat log aktivitas: ' + err.message, data: [] };
  }
}

/**
 * ================================================================================
 * 📊 MODUL 2: DASHBOARD EKSEKUTIF (MURNI METRIK & LEADERBOARDS)
 * ================================================================================
 */

function getDashboardSummary(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid. Silakan login ulang.' };
    }
    if (!canAccessModule(userSession, 'dashboard')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat Dashboard Eksekutif.' };
    }
    var superUser = isSuperAdmin(userSession);
    var globalView = hasGlobalScope(userSession);
    var canSeeUsersBadge = canAccessModule(userSession, 'users');
    var userEmail = (userSession.email || '').toString().toLowerCase().trim();
    var userName = (userSession.nama || '').toString().toLowerCase().trim();

    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        scope: globalView ? 'all' : 'mine',
        totalChannel: 0,
        totalAktif: 0,
        totalTidakAktif: 0,
        sudahMonet: 0,
        belumMonet: 0,
        totalPendapatan: 0,
        topBelumMonet: [],
        topSudahMonet: [],
        todayUploads: [],
        overdueCount: 0,
        leaderboardUnmonetized: [],
        leaderboardMonetized: [],
        kpis: {
          totalChannels: 0, activeChannels: 0, inactiveChannels: 0,
          monetizedChannels: 0, unmonetizedChannels: 0, totalRevenue: 0,
          overdueCount: 0, todayTasksCount: 0, pendingUsersCount: 0
        }
      };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 22).getDisplayValues();

    var totalChannel = 0;
    var totalAktif = 0;
    var totalTidakAktif = 0;
    var sudahMonet = 0;
    var belumMonet = 0;
    var totalPendapatan = 0;
    var topBelumMonet = [];
    var topSudahMonet = [];
    var todayUploads = [];
    var overdueCount = 0;

    var now = new Date();
    var todayYmdWib = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd').split('-');
    var todayYear = todayYmdWib[0];
    var todayMonth = todayYmdWib[1];
    var todayDay = todayYmdWib[2];
    var todayDateNum = parseInt(todayYear + todayMonth + todayDay, 10);
    var curMonthStr = todayYear + '-' + todayMonth;

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var chId = r[0];
      var logoUrl = r[1];
      var name = r[2];
      var link = r[3];
      var subNum = parseInt((r[4] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var jamNum = parseInt((r[5] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var pengelola = (r[6] || '').toString().toLowerCase().trim();
      var kategori = r[7];
      var niche = r[8];
      var statusChannel = (r[9] || 'Aktif').toString().trim();
      var monetStatus = (r[10] || '').toString().trim();
      var jamPublish = (r[11] || '14:00').toString().trim();
      var nextUploadRaw = (r[12] || '').toString().trim();
      var riwayatJson = r[19];
      var statusHapus = (r[21] || 'Active').toString().trim();

      if (!chId && !name) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      // Scoping: Jika bukan scope Global, saring murni ke datanya sendiri
      if (!globalView) {
        var matchMine = (userEmail && pengelola === userEmail) || (userName && pengelola === userName);
        if (!matchMine) continue;
      }

      totalChannel++;
      var isMonet = (monetStatus.toLowerCase() === 'sudah monet' || monetStatus.toLowerCase() === 'monet');
      if (isMonet) sudahMonet++;
      else belumMonet++;

      var isAktif = (statusChannel.toLowerCase() === 'aktif');
      if (isAktif) totalAktif++;
      else totalTidakAktif++;

      // Ambil pendapatan bulan berjalan dari Riwayat_Pendapatan_JSON
      var runningRevenue = 0;
      if (riwayatJson) {
        try {
          var historyList = JSON.parse(riwayatJson);
          for (var h = 0; h < historyList.length; h++) {
            if (historyList[h].bulan === curMonthStr) {
              runningRevenue = parseFloat(historyList[h].pendapatan || historyList[h].total) || 0;
              break;
            }
          }
        } catch (e) {}
      }
      totalPendapatan += runningRevenue;

      // 2 Leaderboards
      if (isMonet) {
        topSudahMonet.push({
          id: chId,
          name: name,
          nama: name,
          logoUrl: logoUrl,
          pengelola: r[6] || '-',
          pendapatan: runningRevenue,
          link: link,
          niche: niche,
          kategori: kategori
        });
      } else {
        var score = (subNum * 1) + (jamNum * 2);
        topBelumMonet.push({
          id: chId,
          name: name,
          nama: name,
          logoUrl: logoUrl,
          pengelola: r[6] || '-',
          subscribers: subNum,
          subs: subNum,
          watchTime: jamNum,
          jam: jamNum,
          score: score,
          skor: score,
          link: link,
          niche: niche
        });
      }

      // Target Upload Hari Ini & Overdue (khusus channel aktif)
      if (isAktif && nextUploadRaw) {
        var isToday = false;
        var isOverdue = false;

        var datePart = nextUploadRaw.split(' ')[0];
        if (datePart.indexOf('/') !== -1) {
          var p = datePart.split('/');
          if (p.length === 3) {
            var dD = ('0' + p[0]).slice(-2);
            var dM = ('0' + p[1]).slice(-2);
            var dY = p[2].length === 2 ? ('20' + p[2]) : p[2];
            var dateNum = parseInt(dY + dM + dD, 10);
            if (dD === todayDay && dM === todayMonth && dY === todayYear) isToday = true;
            else if (dateNum < todayDateNum) { isOverdue = true; overdueCount++; }
          }
        } else if (datePart.indexOf('-') !== -1) {
          var p2 = datePart.split('-');
          if (p2.length === 3) {
            var dY2, dM2, dD2;
            if (p2[0].length === 4) { dY2 = p2[0]; dM2 = ('0' + p2[1]).slice(-2); dD2 = ('0' + p2[2]).slice(-2); }
            else { dD2 = ('0' + p2[0]).slice(-2); dM2 = ('0' + p2[1]).slice(-2); dY2 = p2[2]; }
            var dateNum2 = parseInt(dY2 + dM2 + dD2, 10);
            if (dD2 === todayDay && dM2 === todayMonth && dY2 === todayYear) isToday = true;
            else if (dateNum2 < todayDateNum) { isOverdue = true; overdueCount++; }
          }
        }

        if (isToday || isOverdue) {
          todayUploads.push({
            id: chId,
            name: name,
            logoUrl: logoUrl,
            niche: niche,
            kategori: kategori,
            isMonet: isMonet,
            statusMonet: monetStatus,
            subscribers: subNum,
            watchTime: jamNum,
            pendapatan: runningRevenue,
            jamPublish: jamPublish || '14:00',
            nextUpload: nextUploadRaw,
            pengelola: r[6] || '-',
            isOverdue: isOverdue,
            link: link
          });
        }
      }
    }

    // Sort Leaderboards
    topBelumMonet.sort(function(a, b) { return b.score - a.score; });
    topBelumMonet = topBelumMonet.slice(0, 10);

    topSudahMonet.sort(function(a, b) { return b.pendapatan - a.pendapatan; });
    topSudahMonet = topSudahMonet.slice(0, 10);

    var pendingUsersCount = 0;
    if (canSeeUsersBadge) {
      try {
        var uSheet = getUserSheet_();
        var uLast = uSheet.getLastRow();
        if (uLast > 1) {
          var uData = uSheet.getRange(2, 15, uLast - 1, 5).getDisplayValues();
          for (var ui = 0; ui < uData.length; ui++) {
            if ((uData[ui][4] || '').toString().toLowerCase() === 'deleted') continue;
            var st = (uData[ui][0] || '').toString().toLowerCase();
            if (st === 'pending' || st === 'pending approval') pendingUsersCount++;
          }
        }
      } catch (e) {}
    }

    return {
      success: true,
      scope: globalView ? 'all' : 'mine',
      totalChannel: totalChannel,
      totalAktif: totalAktif,
      totalTidakAktif: totalTidakAktif,
      sudahMonet: sudahMonet,
      belumMonet: belumMonet,
      totalPendapatan: totalPendapatan,
      topBelumMonet: topBelumMonet,
      topSudahMonet: topSudahMonet,
      todayUploads: todayUploads,
      overdueCount: overdueCount,
      leaderboardUnmonetized: topBelumMonet,
      leaderboardMonetized: topSudahMonet,
      kpis: {
        totalChannels: totalChannel,
        activeChannels: totalAktif,
        inactiveChannels: totalTidakAktif,
        monetizedChannels: sudahMonet,
        unmonetizedChannels: belumMonet,
        totalRevenue: totalPendapatan,
        overdueCount: overdueCount,
        todayTasksCount: todayUploads.length,
        pendingUsersCount: pendingUsersCount
      }
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat ringkasan dashboard: ' + err.message };
  }
}

/**
 * ================================================================================
 * 📅 MODUL 3: JADWAL PENGERJAAN & SELESAI PENGERJAAN CERDAS
 * ================================================================================
 */

function quickUpdateUpload(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'jadwal')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin Jadwal Pengerjaan.' };
    }
    if (!canPerformModuleAction(userSession, 'jadwal', 'edit')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menyelesaikan atau mengedit progres jadwal.' };
    }

    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data channel kosong' };

    var targetId = (payload.channelId || payload.id || '').toString().trim();
    var data = sheet.getRange(2, 1, lastRow - 1, 7).getDisplayValues();
    var targetRow = -1;
    var rowOwner = '';
    var channelName = targetId;

    for (var i = 0; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim() === targetId) {
        targetRow = i + 2;
        channelName = (data[i][2] || '').toString().trim() || targetId;
        rowOwner = (data[i][6] || '').toString().toLowerCase().trim();
        break;
      }
    }

    if (targetRow === -1) return { success: false, message: 'Channel tidak ditemukan' };

    if (!hasGlobalScope(userSession)) {
      var uEmail = (userSession.email || '').toLowerCase().trim();
      var uName = (userSession.nama || '').toLowerCase().trim();
      if (rowOwner !== uEmail && rowOwner !== uName) {
        return { success: false, message: 'Akses ditolak: Anda hanya boleh menyelesaikan jadwal channel Anda sendiri.' };
      }
    }

    var isMonet = (payload.isMonet === true || payload.isMonet === 'YES');
    var nextDate = (payload.nextDate || payload.tglUploadNext || '').toString().trim();

    if (nextDate) {
      sheet.getRange(targetRow, 13).setValue(nextDate);
    }

    if (!isMonet) {
      var subVal = payload.subs !== undefined ? payload.subs : payload.totalSub;
      if (subVal !== undefined && subVal !== '') sheet.getRange(targetRow, 5).setValue(subVal);
      var jamVal = payload.jam !== undefined ? payload.jam : payload.totalJam;
      if (jamVal !== undefined && jamVal !== '') sheet.getRange(targetRow, 6).setValue(jamVal);
      logActivity_('Selesai Tugas', targetId, 'Update Belum Monet: Subs ' + subVal + ', Jam ' + jamVal + ', Next: ' + nextDate, userSession);
    } else {
      var rawNominal = (payload.pendapatan !== undefined ? payload.pendapatan : (payload.nominal || '0')).toString().replace(/[^0-9.-]/g, '');
      var nominal = parseFloat(rawNominal) || 0;

      var currentJsonStr = (sheet.getRange(targetRow, 20).getValue() || '').toString();
      var historyList = [];
      try {
        if (currentJsonStr && currentJsonStr.trim() !== '') {
          historyList = JSON.parse(currentJsonStr);
        }
      } catch (e) {
        historyList = [];
      }

      var curBulanStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM');
      var foundMonth = false;
      for (var hIdx = 0; hIdx < historyList.length; hIdx++) {
        if (historyList[hIdx].bulan === curBulanStr) {
          historyList[hIdx].pendapatan = nominal;
          historyList[hIdx].total = nominal;
          foundMonth = true;
          break;
        }
      }
      if (!foundMonth) {
        historyList.push({ bulan: curBulanStr, pendapatan: nominal, total: nominal });
      }

      sheet.getRange(targetRow, 20).setValue(JSON.stringify(historyList));
      logActivity_('Selesai Tugas', targetId, 'Update Sudah Monet: Pendapatan Rp ' + nominal + ' (snapshot bulan berjalan), Next: ' + nextDate, userSession);
    }

    SpreadsheetApp.flush();
    recordWorkActivity_(
      userSession,
      'Upload',
      channelName,
      isMonet
        ? ('Selesai upload & update estimasi pendapatan Rp ' + nominal)
        : ('Selesai upload (Subs: ' + (subVal !== undefined && subVal !== '' ? subVal : '-') + ', Jam: ' + (jamVal !== undefined && jamVal !== '' ? jamVal : '-') + ')'),
      'Otomatis',
      targetId
    );
    if (nextDate) {
      recordWorkActivity_(
        userSession,
        'Menjadwalkan',
        channelName,
        'Menjadwalkan upload berikutnya ke tanggal ' + nextDate,
        'Otomatis',
        targetId
      );
    }
    return { success: true, message: 'Tugas channel ' + targetId + ' selesai! Jadwal diperbarui ke ' + nextDate };
  } catch (err) {
    return { success: false, message: 'Gagal update pengerjaan: ' + err.message };
  }
}

function getCalendarSchedule(year, month, userSession, userFilter) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'jadwal')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat Jadwal Pengerjaan.' };
    }

    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        todayStr: '-',
        todayDateKey: '',
        todayChannels: [],
        overdueChannels: [],
        queueChannels: [],
        teamList: [],
        totalTasks: 0,
        calendarTasksByDate: {},
        events: {},
        isSuperAdmin: isSuperAdmin(userSession)
      };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, 22).getDisplayValues();
    var superUser = isSuperAdmin(userSession);
    var globalView = hasGlobalScope(userSession);
    var userEmail = (userSession.email || '').toString().toLowerCase().trim();
    var userName = (userSession.nama || '').toString().toLowerCase().trim();
    var filterUserTrim = (userFilter || '').toString().toLowerCase().trim();

    var targetYM = year + '-' + ('0' + month).slice(-2);
    var events = {};
    var todayChannels = [];
    var overdueChannels = [];
    var queueChannels = [];
    var teamCountMap = {};
    var totalTasksCount = 0;

    var now = new Date();
    var todayWibParts = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd').split('-');
    var todayYearNum = parseInt(todayWibParts[0], 10);
    var todayMonNum = parseInt(todayWibParts[1], 10);
    var todayDayNum = parseInt(todayWibParts[2], 10);
    var todayDateKey = todayWibParts.join('-');
    var todayZero = new Date(todayYearNum, todayMonNum - 1, todayDayNum);
    var curMonthStr = todayWibParts[0] + '-' + todayWibParts[1];

    var dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var todayStr = dayNames[todayZero.getDay()] + ', ' + todayDayNum + ' ' + monthNames[todayMonNum - 1] + ' ' + todayYearNum;

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var chId = r[0];
      var logoUrl = r[1];
      var name = r[2];
      var link = r[3];
      var subNum = parseInt((r[4] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var jamNum = parseInt((r[5] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var rawPengelola = (r[6] || '').toString().trim();
      var pengelolaLower = rawPengelola.toLowerCase();
      var kategori = r[7];
      var niche = r[8];
      var statusCh = (r[9] || 'Aktif').toString().trim();
      var monetStatus = (r[10] || '').toString().trim();
      var rawJam = (r[11] || '14:00').toString().trim();
      var nextDate = (r[12] || '').toString().trim();
      var visualUrl = r[14];
      var audioUrl = r[15];
      var thumbnailUrl = r[16];
      var riwayatJson = r[19];
      var statusHapus = (r[21] || 'Active').toString().trim();

      if (!chId && !name) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;
      if (statusCh.toLowerCase() === 'tidak aktif' || statusCh.toLowerCase() === 'nonaktif') continue;

      var jamPublish = rawJam.replace(/\./g, ':');
      var mTime = jamPublish.match(/^(\d{1,2}):(\d{1,2})/);
      if (mTime) {
        jamPublish = ('0' + mTime[1]).slice(-2) + ':' + ('0' + mTime[2]).slice(-2);
      } else {
        jamPublish = '14:00';
      }

      if (!globalView) {
        if (pengelolaLower !== userEmail && pengelolaLower !== userName) continue;
      }

      var teamKey = rawPengelola || 'Unassigned';
      teamCountMap[teamKey] = (teamCountMap[teamKey] || 0) + 1;
      totalTasksCount++;

      if (globalView && filterUserTrim && filterUserTrim !== 'semua' && filterUserTrim !== 'all') {
        if (pengelolaLower !== filterUserTrim && rawPengelola !== userFilter) {
          continue;
        }
      }

      var isMonet = (monetStatus.toLowerCase() === 'sudah monet' || monetStatus.toLowerCase() === 'monet' || monetStatus.toUpperCase() === 'YES');

      var runningRevenue = 0;
      if (riwayatJson) {
        try {
          var historyList = JSON.parse(riwayatJson);
          for (var h = 0; h < historyList.length; h++) {
            if (historyList[h].bulan === curMonthStr) {
              runningRevenue = parseFloat(historyList[h].pendapatan || historyList[h].total) || 0;
              break;
            }
          }
        } catch (e) {}
      }

      var isoDate = '';
      var displayDate = '';
      var diffDays = 0;
      var statusBadge = 'Terjadwal';
      var badgeClass = 'upcoming';

      if (nextDate) {
        var dateParts = nextDate.split(' ')[0];
        var dDay = 0, dMon = 0, dYr = 0;
        if (dateParts.indexOf('/') !== -1) {
          var pSlash = dateParts.split('/');
          if (pSlash.length === 3) {
            dDay = parseInt(pSlash[0], 10);
            dMon = parseInt(pSlash[1], 10);
            dYr = parseInt(pSlash[2].length === 2 ? ('20' + pSlash[2]) : pSlash[2], 10);
          }
        } else if (dateParts.indexOf('-') !== -1) {
          var pDash = dateParts.split('-');
          if (pDash.length === 3) {
            if (pDash[0].length === 4) {
              dYr = parseInt(pDash[0], 10);
              dMon = parseInt(pDash[1], 10);
              dDay = parseInt(pDash[2], 10);
            } else {
              dDay = parseInt(pDash[0], 10);
              dMon = parseInt(pDash[1], 10);
              dYr = parseInt(pDash[2].length === 2 ? ('20' + pDash[2]) : pDash[2], 10);
            }
          }
        }

        if (dYr > 0 && dMon > 0 && dDay > 0) {
          isoDate = dYr + '-' + ('0' + dMon).slice(-2) + '-' + ('0' + dDay).slice(-2);
          displayDate = ('0' + dDay).slice(-2) + '/' + ('0' + dMon).slice(-2) + '/' + dYr;
          var targetDateObj = new Date(dYr, dMon - 1, dDay);
          var diffMs = targetDateObj.getTime() - todayZero.getTime();
          diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            statusBadge = 'Terlewat ' + Math.abs(diffDays) + ' hari';
            badgeClass = 'overdue';
          } else if (diffDays === 0) {
            statusBadge = 'Hari Ini';
            badgeClass = 'today';
          } else {
            statusBadge = 'Mendatang';
            badgeClass = 'upcoming';
          }
        }
      }

      var chObj = {
        id: chId,
        nama: name,
        name: name,
        logoUrl: logoUrl,
        link: link,
        subs: subNum,
        subscribers: subNum,
        jam: jamNum,
        watchTime: jamNum,
        pengelola: rawPengelola || '-',
        kategori: kategori || '-',
        niche: niche || '-',
        status: statusCh,
        monetisasi: isMonet ? 'YES' : 'NO',
        isMonet: isMonet,
        jamPublish: jamPublish,
        nextDate: nextDate,
        isoDate: isoDate,
        displayDate: displayDate,
        scheduleFormatted: displayDate ? (displayDate + ' ' + jamPublish) : '-',
        diffDays: diffDays,
        statusBadge: statusBadge,
        badgeClass: badgeClass,
        pendapatanBulanIni: runningRevenue,
        visualUrl: visualUrl,
        audioUrl: audioUrl,
        thumbnailUrl: thumbnailUrl,
        thumbnails: parseAssetList(thumbnailUrl),
        audios: parseAssetList(audioUrl),
        videos: parseAssetList(visualUrl)
      };

      if (isoDate) {
        if (isoDate.indexOf(targetYM) === 0) {
          if (!events[isoDate]) events[isoDate] = [];
          events[isoDate].push(chObj);
        }

        if (diffDays === 0) {
          todayChannels.push(chObj);
        } else if (diffDays < 0) {
          overdueChannels.push(chObj);
        }
        queueChannels.push(chObj);
      }
    }

    queueChannels.sort(function(a, b) {
      if (a.diffDays !== b.diffDays) {
        return a.diffDays - b.diffDays;
      }
      return (a.jamPublish || '').localeCompare(b.jamPublish || '');
    });

    var teamList = [];
    for (var k in teamCountMap) {
      teamList.push({ name: k, count: teamCountMap[k] });
    }
    teamList.sort(function(a, b) { return b.count - a.count; });

    return {
      success: true,
      todayStr: todayStr,
      todayDateKey: todayDateKey,
      todayChannels: todayChannels,
      overdueChannels: overdueChannels,
      queueChannels: queueChannels,
      teamList: teamList,
      totalTasks: totalTasksCount,
      calendarTasksByDate: events,
      events: events,
      isSuperAdmin: superUser
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat jadwal: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🎬 MODUL 4: DATABASE CHANNEL (10 KOLOM BAKU MANDIRI)
 * ================================================================================
 */

/**
 * Helper Parser Aset Multi-Link (JSON Array atau comma separated)
 */
function parseAssetList(raw) {
  if (!raw) return [];
  try {
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  var str = raw.toString().trim();
  if (!str) return [];
  var parts = str.split(',');
  return parts.map(function(u) {
    return { url: u.trim(), name: 'Aset', date: '' };
  }).filter(function(x) { return x.url.length > 0; });
}

function getMasterDropdowns(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid. Silakan login ulang.' };
    }

    var sheet = getDropdownMasterSheet_();
    var lastRow = sheet ? sheet.getLastRow() : 0;
    var kategoris = [];
    var niches = [];
    if (sheet && lastRow > 1) {
      var data = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
      for (var i = 0; i < data.length; i++) {
        var k = (data[i][0] || '').toString().trim();
        var n = (data[i][1] || '').toString().trim();
        if (k && kategoris.indexOf(k) === -1) kategoris.push(k);
        if (n && niches.indexOf(n) === -1) niches.push(n);
      }
    }
    if (kategoris.length === 0) {
      kategoris = ['Long-Form', 'Shorts', 'Hiburan', 'Edukasi', 'Vlogging', 'Musik', 'Berita', 'Teknologi', 'Gaming', 'Kuliner'];
    }
    if (niches.length === 0) {
      niches = ['Ternak', 'Gaming', 'Keuangan', 'Teknologi', 'Kuliner', 'Otomotif', 'Tutorial', 'Fakta Menarik', 'Horor & Konspirasi', 'Kesehatan'];
    }

    // Ambil daftar Akun Email Aktif sesuai hak akses pemilik (Scoping Anti-Leak)
    var emailsList = [];
    if (canAccessModule(userSession, 'email') || canAccessModule(userSession, 'channel')) {
      var globalView = hasGlobalScope(userSession);
      var uEmail = (userSession.email || '').toLowerCase().trim();
      var uName = (userSession.nama || '').toLowerCase().trim();
      var emailSheet = getEmailSheet_();
      if (emailSheet && emailSheet.getLastRow() > 1) {
        var emailRaw = emailSheet.getRange(2, 1, emailSheet.getLastRow() - 1, 10).getDisplayValues();
        for (var e = 0; e < emailRaw.length; e++) {
          var emId = (emailRaw[e][0] || '').toString().trim();
          var emAlamat = (emailRaw[e][1] || '').toString().trim();
          var emPemilik = (emailRaw[e][7] || '').toString().trim();
          var emStatusHapus = (emailRaw[e][9] || 'Active').toString().trim();
          if (!emAlamat && !emId) continue;
          if (emStatusHapus.toLowerCase() === 'deleted') continue;

          if (!globalView) {
            var pLower = emPemilik.toLowerCase();
            if (pLower !== uEmail && pLower !== uName) continue;
          }

          emailsList.push({
            id: emId,
            email: emAlamat,
            alamatEmail: emAlamat,
            pemilik: emPemilik
          });
        }
      }
    }

    return { 
      success: true, 
      kategoris: kategoris, 
      niches: niches, 
      categories: kategoris,
      emails: emailsList 
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat dropdown: ' + err.message };
  }
}

function getEmailOptions(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid.', emails: [] };
    }
    if (!canAccessModule(userSession, 'email') && !canAccessModule(userSession, 'channel')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat opsi email.', emails: [] };
    }
    var globalView = hasGlobalScope(userSession);
    var uEmail = (userSession.email || '').toLowerCase().trim();
    var uName = (userSession.nama || '').toLowerCase().trim();

    var emailSheet = getEmailSheet_();
    var emailsList = [];
    if (emailSheet && emailSheet.getLastRow() > 1) {
      var emailRaw = emailSheet.getRange(2, 1, emailSheet.getLastRow() - 1, 10).getDisplayValues();
      for (var e = 0; e < emailRaw.length; e++) {
        var emId = (emailRaw[e][0] || '').toString().trim();
        var emAlamat = (emailRaw[e][1] || '').toString().trim();
        var emPemilik = (emailRaw[e][7] || '').toString().trim();
        var emStatusHapus = (emailRaw[e][9] || 'Active').toString().trim();
        if (!emAlamat && !emId) continue;
        if (emStatusHapus.toLowerCase() === 'deleted') continue;

        if (!globalView) {
          var pLower = emPemilik.toLowerCase();
          if (pLower !== uEmail && pLower !== uName) continue;
        }

        emailsList.push({
          id: emId,
          email: emAlamat,
          alamatEmail: emAlamat,
          pemilik: emPemilik
        });
      }
    }
    return { success: true, emails: emailsList };
  } catch (err) {
    return { success: false, message: 'Gagal memuat opsi email: ' + err.message, emails: [] };
  }
}

function getChannelsData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'channel')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat Database Channel.', data: [], items: [] };
    }

    params = params || {};
    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [], items: [], totalPages: 0, totalRecords: 0, totalCount: 0, totalAll: 0, currentPage: 1, page: 1, pageSize: 20 };
    }

    var superUser = isSuperAdmin(userSession);
    var globalView = hasGlobalScope(userSession);
    var userEmail = (userSession.email || '').toString().toLowerCase().trim();
    var userName = (userSession.nama || '').toString().toLowerCase().trim();

    var page = Math.max(1, parseInt(params.page, 10) || 1);
    var limit = Math.max(1, parseInt(params.pageSize || params.limit, 10) || 20);
    var search = (params.search || '').toString().toLowerCase().trim();
    var filterKat = (params.kategori || 'ALL').toString().trim();
    var filterNiche = (params.niche || 'ALL').toString().trim();
    var filterStatus = (params.status || 'ALL').toString().trim();
    var filterMonet = (params.monet || 'ALL').toString().trim();
    var filterPengelola = (params.pengelola || 'ALL').toString().trim();

    var raw = sheet.getRange(2, 1, lastRow - 1, 22).getDisplayValues();
    var list = [];
    var totalAllActive = 0;
    var pengelolaMap = {};
    var currentMonthYm = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM');

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var chId = r[0];
      var logoUrl = r[1];
      var nama = r[2];
      var linkYt = r[3];
      var sub = parseInt((r[4] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var jam = parseInt((r[5] || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var pengelola = r[6];
      var kategori = r[7];
      var niche = r[8];
      var rawStatus = (r[9] || 'Aktif').toString().trim();
      var rawMonet = (r[10] || 'Belum Monet').toString().trim();
      var jamPublish = r[11] || '14:00';
      var nextUpload = r[12];
      var visualUrl = r[14];
      var audioUrl = r[15];
      var thumbnailUrl = r[16];
      var judulDefault = r[17];
      var deskripsiDefault = r[18];
      var riwayatJson = r[19];
      var emailId = r[20];
      var statusHapus = r[21] || 'Active';

      if (!chId && !nama) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      if (!globalView) {
        var pLower = (pengelola || '').toLowerCase().trim();
        if (pLower !== userEmail && pLower !== userName) continue;
      }

      if (pengelola && pengelola.toString().trim()) {
        pengelolaMap[pengelola.toString().trim()] = true;
      }

      if (globalView && filterPengelola && filterPengelola.toUpperCase() !== 'ALL') {
        if ((pengelola || '').toLowerCase().trim() !== filterPengelola.toLowerCase().trim()) continue;
      }

      totalAllActive++;

      var isAktif = (rawStatus.toLowerCase() === 'aktif');
      var statusNormalized = isAktif ? 'Aktif' : 'Nonaktif';

      var isMonet = (rawMonet.toUpperCase().includes('SUDAH') || rawMonet.toUpperCase() === 'YES' || rawMonet.toUpperCase() === 'TRUE');
      var monetNormalized = isMonet ? 'Sudah Monet' : 'Belum Monet';

      var pendapatanBulanIni = 0;
      try {
        var revArr = JSON.parse(riwayatJson || '[]');
        if (Array.isArray(revArr)) {
          for (var j = 0; j < revArr.length; j++) {
            if (revArr[j].bulan === currentMonthYm) {
              pendapatanBulanIni = parseFloat(revArr[j].total || revArr[j].pendapatan) || 0;
              break;
            }
          }
        }
      } catch (e) {}

      if (filterKat !== 'ALL' && kategori !== filterKat) continue;
      if (filterNiche !== 'ALL' && niche !== filterNiche) continue;
      if (filterStatus !== 'ALL') {
        if (filterStatus.toLowerCase() === 'aktif' && !isAktif) continue;
        if ((filterStatus.toLowerCase() === 'tidak aktif' || filterStatus.toLowerCase() === 'nonaktif') && isAktif) continue;
      }
      if (filterMonet !== 'ALL') {
        if (filterMonet.toUpperCase() === 'YES' && !isMonet) continue;
        if (filterMonet.toUpperCase() === 'NO' && isMonet) continue;
      }

      if (search) {
        var str = (chId + ' ' + nama + ' ' + pengelola + ' ' + kategori + ' ' + niche).toLowerCase();
        if (str.indexOf(search) === -1) continue;
      }

      list.push({
        id: chId,
        logoUrl: logoUrl,
        nama: nama,
        name: nama,
        link: linkYt,
        linkYt: linkYt,
        subscribers: sub,
        subs: sub,
        watchTime: jam,
        jam: jam,
        pengelola: pengelola,
        kategori: kategori,
        niche: niche,
        status: statusNormalized,
        statusChannel: statusNormalized,
        statusCh: statusNormalized,
        isAktif: isAktif,
        statusMonet: monetNormalized,
        monetisasi: isMonet ? 'YES' : 'NO',
        monet: isMonet ? 'YES' : 'NO',
        isMonet: isMonet,
        pendapatan: pendapatanBulanIni,
        estimasiPendapatan: pendapatanBulanIni,
        jamPublish: jamPublish,
        nextUpload: nextUpload,
        nextDate: nextUpload,
        visualUrl: visualUrl,
        audioUrl: audioUrl,
        thumbnailUrl: thumbnailUrl,
        thumbnails: parseAssetList(thumbnailUrl),
        audios: parseAssetList(audioUrl),
        videos: parseAssetList(visualUrl),
        judulDefault: judulDefault,
        deskripsiDefault: deskripsiDefault,
        riwayatPendapatan: riwayatJson,
        emailId: emailId,
        emailTerkait: emailId
      });
    }

    var totalRecords = list.length;
    var totalPages = Math.ceil(totalRecords / limit) || 1;
    if (page > totalPages) page = totalPages;
    var startIdx = (page - 1) * limit;
    var paginated = list.slice(startIdx, startIdx + limit);

    return {
      success: true,
      data: paginated,
      items: paginated,
      totalPages: totalPages,
      totalRecords: totalRecords,
      totalCount: totalRecords,
      totalAll: totalAllActive,
      currentPage: page,
      page: page,
      pageSize: limit,
      pengelolaList: globalView ? Object.keys(pengelolaMap).sort() : []
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat channel: ' + err.message };
  }
}

function saveChannel(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'channel')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengelola Database Channel.' };
    }

    payload = payload || {};
    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    var id = (payload.id || '').toString().trim();
    var isEdit = false;
    var targetRow = -1;
    var existingRow = null;

    if (id && lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        if ((ids[i][0] || '').toString().trim() === id) {
          targetRow = i + 2;
          isEdit = true;
          existingRow = sheet.getRange(targetRow, 1, 1, 22).getDisplayValues()[0];
          break;
        }
      }
    }

    var superUser = isSuperAdmin(userSession);
    var globalScope = hasGlobalScope(userSession);
    if (isEdit) {
      if (!canPerformModuleAction(userSession, 'channel', 'edit')) {
        return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin Edit Data pada Database Channel.' };
      }
      if (!globalScope && existingRow) {
        var existingOwner = (existingRow[6] || '').toString().toLowerCase().trim();
        var uEmail = (userSession.email || '').toLowerCase().trim();
        var uName = (userSession.nama || '').toLowerCase().trim();
        if (existingOwner !== uEmail && existingOwner !== uName) {
          return { success: false, message: 'Akses ditolak: Anda tidak dapat mengubah channel milik pengelola lain.' };
        }
      }
    } else {
      if (!canPerformModuleAction(userSession, 'channel', 'add')) {
        return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin Tambah Data pada Database Channel.' };
      }
      id = generateId_('CHN', sheet);
    }

    var creator = (userSession.nama || userSession.email) || 'Admin';
    var finalPengelola = existingRow ? existingRow[6] : creator;
    if (superUser && payload.pengelola && payload.pengelola.toString().trim()) {
      finalPengelola = payload.pengelola.toString().trim();
    }

    var rawStatus = (payload.statusChannel !== undefined ? payload.statusChannel : (payload.status !== undefined ? payload.status : (payload.statusCh !== undefined ? payload.statusCh : 'Aktif'))).toString().trim();
    var finalStatus = (rawStatus.toLowerCase() === 'aktif') ? 'Aktif' : 'Nonaktif';

    var rawMonet = (payload.statusMonet !== undefined ? payload.statusMonet : (payload.monetisasi !== undefined ? payload.monetisasi : (payload.monet !== undefined ? payload.monet : 'Belum Monet'))).toString().trim();
    var isMonet = (rawMonet.toUpperCase().includes('SUDAH') || rawMonet.toUpperCase() === 'YES' || rawMonet.toUpperCase() === 'TRUE');
    var finalMonet = isMonet ? 'Sudah Monet' : 'Belum Monet';

    var riwayatJson = (payload.riwayatPendapatan !== undefined ? payload.riwayatPendapatan : (existingRow ? existingRow[19] : '[]')).toString().trim();
    if (isMonet && (payload.pendapatan !== undefined || payload.estimasiPendapatan !== undefined)) {
      var nominal = parseFloat(payload.pendapatan !== undefined ? payload.pendapatan : payload.estimasiPendapatan) || 0;
      var currentYm = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM');
      var arr = [];
      try { arr = JSON.parse(riwayatJson || '[]'); } catch (e) { arr = []; }
      var found = false;
      for (var k = 0; k < arr.length; k++) {
        if (arr[k].bulan === currentYm) {
          arr[k].total = nominal;
          arr[k].pendapatan = nominal;
          found = true;
          break;
        }
      }
      if (!found) {
        arr.push({ bulan: currentYm, total: nominal, pendapatan: nominal });
      }
      riwayatJson = JSON.stringify(arr);
    }

    var thumbVal = '';
    if (payload.thumbnails !== undefined) {
      thumbVal = (typeof payload.thumbnails === 'object') ? JSON.stringify(payload.thumbnails) : payload.thumbnails;
    } else if (payload.thumbnailUrl !== undefined) {
      thumbVal = payload.thumbnailUrl;
    } else if (existingRow) {
      thumbVal = existingRow[16];
    }

    var audioVal = '';
    if (payload.audios !== undefined) {
      audioVal = (typeof payload.audios === 'object') ? JSON.stringify(payload.audios) : payload.audios;
    } else if (payload.audioUrl !== undefined) {
      audioVal = payload.audioUrl;
    } else if (existingRow) {
      audioVal = existingRow[15];
    }

    var visualVal = '';
    if (payload.videos !== undefined) {
      visualVal = (typeof payload.videos === 'object') ? JSON.stringify(payload.videos) : payload.videos;
    } else if (payload.visualUrl !== undefined) {
      visualVal = payload.visualUrl;
    } else if (existingRow) {
      visualVal = existingRow[14];
    }

    var subsVal = parseInt((payload.subscribers !== undefined ? payload.subscribers : (payload.subs !== undefined ? payload.subs : (existingRow ? existingRow[4] : 0))).toString().replace(/[^0-9]/g, ''), 10) || 0;
    var jamVal = parseInt((payload.watchTime !== undefined ? payload.watchTime : (payload.jam !== undefined ? payload.jam : (existingRow ? existingRow[5] : 0))).toString().replace(/[^0-9]/g, ''), 10) || 0;

    var row = [
      id,
      payload.logoUrl !== undefined ? payload.logoUrl : (existingRow ? existingRow[1] : ''),
      payload.nama !== undefined ? payload.nama : (payload.name !== undefined ? payload.name : (existingRow ? existingRow[2] : '')),
      payload.link !== undefined ? payload.link : (payload.linkYt !== undefined ? payload.linkYt : (existingRow ? existingRow[3] : '')),
      subsVal,
      jamVal,
      finalPengelola,
      payload.kategori || (existingRow ? existingRow[7] : 'Umum'),
      payload.niche !== undefined ? payload.niche : (existingRow ? existingRow[8] : 'Umum'),
      finalStatus,
      finalMonet,
      payload.jamPublish || (existingRow ? existingRow[11] : '14:00'),
      payload.nextUpload !== undefined ? payload.nextUpload : (payload.nextDate !== undefined ? payload.nextDate : (existingRow ? existingRow[12] : '')),
      existingRow ? existingRow[13] : '',
      visualVal,
      audioVal,
      thumbVal,
      payload.judulDefault !== undefined ? payload.judulDefault : (existingRow ? existingRow[17] : ''),
      payload.deskripsiDefault !== undefined ? payload.deskripsiDefault : (existingRow ? existingRow[18] : ''),
      riwayatJson,
      payload.emailId !== undefined ? payload.emailId : (payload.emailTerkait !== undefined ? payload.emailTerkait : (existingRow ? existingRow[20] : '')),
      'Active'
    ];

    if (isEdit && targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    SpreadsheetApp.flush();
    logActivity_(isEdit ? 'Edit Channel' : 'Tambah Channel', id, row[2], userSession);

    if (!isEdit) {
      recordWorkActivity_(
        userSession,
        'Buat Channel',
        row[2] || id,
        'Membuat channel baru (' + (row[7] || '-') + ' / ' + (row[8] || '-') + ')',
        'Otomatis',
        id
      );
    } else if (existingRow) {
      recordChannelEditAutoWork_(userSession, id, row[2] || id, existingRow, row);
    }

    return { success: true, message: 'Channel ' + row[2] + ' berhasil disimpan!', id: id };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan channel: ' + err.message };
  }
}

/**
 * ================================================================================
 * 📁 GOOGLE DRIVE HIERARCHICAL FOLDER ENGINE & SECURE UPLOAD GUARD
 * ================================================================================
 */
function getOrCreateDrivePath_(segments) {
  if (!segments || segments.length === 0) return DriveApp.getRootFolder();
  var currentFolder = null;

  for (var i = 0; i < segments.length; i++) {
    var rawName = (segments[i] || '').toString().trim();
    if (!rawName) rawName = 'Umum';
    var cleanName = rawName.replace(/[\/\\:*?"<>|]/g, '-').trim();

    if (i === 0) {
      var roots = DriveApp.getFoldersByName(cleanName);
      if (roots.hasNext()) {
        currentFolder = roots.next();
      } else {
        currentFolder = DriveApp.createFolder(cleanName);
      }
    } else {
      var subs = currentFolder.getFoldersByName(cleanName);
      if (subs.hasNext()) {
        currentFolder = subs.next();
      } else {
        currentFolder = currentFolder.createFolder(cleanName);
      }
    }
  }

  return currentFolder;
}

function validateSafeUploadPayload_(payload, allowedMimes) {
  if (!payload || !payload.base64Data) {
    return { error: 'Data file tidak ditemukan.' };
  }
  var mime = (payload.mimeType || '').toString().trim().toLowerCase();
  if (allowedMimes && allowedMimes.indexOf(mime) === -1) {
    return { error: 'Tipe file tidak diizinkan (' + (mime || 'unknown') + '). Hanya gambar/audio/PDF resmi yang diperbolehkan.' };
  }
  var rawBase64 = payload.base64Data;
  if (rawBase64.indexOf(',') > -1) {
    rawBase64 = rawBase64.split(',')[1];
  }
  var bytes = Utilities.base64Decode(rawBase64);
  if (bytes.length > 10 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 10 MB.' };
  }
  var safeFileName = (payload.fileName || ('file_' + new Date().getTime())).toString().replace(/[\/\\:*?"<>|]/g, '_').trim();
  return { bytes: bytes, mime: mime, fileName: safeFileName };
}

function uploadChannelAsset(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'channel') || (!canPerformModuleAction(userSession, 'channel', 'add') && !canPerformModuleAction(userSession, 'channel', 'edit'))) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengunggah aset channel.' };
    }

    var safeMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
    var validated = validateSafeUploadPayload_(payload, safeMimes);
    if (validated.error) return { success: false, message: validated.error };

    var blob = Utilities.newBlob(validated.bytes, validated.mime, validated.fileName);

    var type = (payload.assetType || 'thumbnail').toString().toLowerCase();
    var subfolderName = 'Thumbnail';
    if (type === 'audio' || type.indexOf('voice') > -1 || type.indexOf('backsound') > -1) {
      subfolderName = 'Audio';
    } else if (type === 'visual' || type === 'video') {
      subfolderName = 'Visual';
    }

    var chName = (payload.channelName || payload.namaChannel || 'Channel Umum').toString().trim();
    var folder = getOrCreateDrivePath_(['DoGo Studio V1', 'Aset Channel', chName, subfolderName]);

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileUrl = file.getUrl();

    logActivity_('Upload Aset', payload.channelId || '-', subfolderName + ': ' + file.getName() + ' (' + chName + ')', userSession);
    recordWorkActivity_(
      userSession,
      'Cari / Buat Bahan',
      chName,
      'Mengunggah aset ' + subfolderName + ' ke Drive: ' + file.getName(),
      'Otomatis',
      payload.channelId || file.getId()
    );

    return {
      success: true,
      fileUrl: fileUrl,
      fileId: file.getId(),
      fileName: file.getName(),
      subfolder: subfolderName,
      message: 'File berhasil diunggah ke folder ' + subfolderName + ' di Google Drive!'
    };
  } catch (err) {
    return { success: false, message: 'Gagal upload ke Drive: ' + err.message };
  }
}

/**
 * Universal Studio Drive Uploader (AdSense KTP, Pengguna KTP, & Keuangan Studio)
 */
function uploadStudioFile(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };

    var rawMod = (payload && (payload.module || payload.folderType || 'umum')).toString().toLowerCase().trim();
    var moduleName = rawMod;
    if (rawMod === 'adsense_ktp' || rawMod === 'adsense') moduleName = 'adsense';
    else if (rawMod === 'user_ktp' || rawMod === 'user' || rawMod === 'pengguna') moduleName = 'user';
    else if (rawMod === 'finance' || rawMod === 'keuangan' || rawMod === 'nota' || rawMod === 'bukti' || rawMod === 'foto') moduleName = 'finance';

    var isSensitiveKtp = (moduleName === 'adsense' || moduleName === 'user');

    if (isSensitiveKtp) {
      if (moduleName === 'adsense') {
        if (!canAccessModule(userSession, 'adsense') || (!canPerformModuleAction(userSession, 'adsense', 'add') && !canPerformModuleAction(userSession, 'adsense', 'edit'))) {
          return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengunggah dokumen KTP AdSense.' };
        }
      } else {
        var isSelfUserKtp = (moduleName === 'user' && (payload.targetEmail === userSession.email || !payload.targetEmail || payload.targetEmail === '' || payload.targetName === userSession.nama));
        if (!isSuperAdmin(userSession) && !isSelfUserKtp && !canPerformModuleAction(userSession, 'users', 'edit')) {
          return { success: false, message: 'Akses ditolak: Anda tidak berhak mengunggah dokumen KTP pengguna lain.' };
        }
      }
    } else if (moduleName === 'finance' || moduleName === 'keuangan') {
      if (!canAccessFinance(userSession) || (!canPerformModuleAction(userSession, 'finance', 'add') && !canPerformModuleAction(userSession, 'finance', 'edit'))) {
        return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengunggah bukti keuangan.' };
      }
    } else if (!isSuperAdmin(userSession)) {
      return { success: false, message: 'Akses ditolak.' };
    }

    var safeMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    var validated = validateSafeUploadPayload_(payload, safeMimes);
    if (validated.error) return { success: false, message: validated.error };

    var blob = Utilities.newBlob(validated.bytes, validated.mime, validated.fileName);
    var segments = ['DoGo Studio V1'];

    if (moduleName === 'adsense') {
      var adsName = (payload.targetName || 'AdSense Umum').toString().trim();
      segments.push('Database AdSense', adsName);
    } else if (moduleName === 'user' || moduleName === 'pengguna') {
      var uName = (payload.targetName || 'Pengguna Umum').toString().trim();
      segments.push('Database Pengguna', uName);
    } else if (moduleName === 'finance' || moduleName === 'keuangan') {
      var finSub = (payload.subfolder || 'Bukti Transaksi').toString().trim();
      segments.push('Keuangan Studio', finSub);
    } else {
      segments.push('Dokumen Studio');
    }

    var folder = getOrCreateDrivePath_(segments);
    var file = folder.createFile(blob);

    // KTP sensitif diset PRIVATE (hanya dapat diakses via proxy terautentikasi Super Admin)
    if (isSensitiveKtp) {
      file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    } else {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    logActivity_('Upload Berkas Studio', moduleName, file.getName() + ' -> ' + segments.join(' / '), userSession);

    return {
      success: true,
      fileUrl: file.getUrl(),
      url: file.getUrl(),
      fileId: file.getId(),
      fileName: file.getName(),
      folderPath: segments.join(' / '),
      message: 'File berhasil diunggah ke Google Drive!'
    };
  } catch (err) {
    return { success: false, message: 'Gagal upload ke Drive: ' + err.message };
  }
}

/**
 * Proxy Aman Gambar Privat Google Drive (Untuk Pratinjau KTP Super Admin / Bukti Keuangan)
 */
function getProtectedDriveImage(fileUrlOrId, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };

    var s = (fileUrlOrId || '').toString().trim();
    var fileId = s;
    var m1 = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    var m2 = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
    var m3 = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m1) fileId = m1[1];
    else if (m2) fileId = m2[1];
    else if (m3) fileId = m3[1];

    if (!fileId) return { success: false, message: 'ID file Drive tidak valid.' };

    var isOwnKtp = (userSession.fotoKtpUrl && userSession.fotoKtpUrl.indexOf(fileId) !== -1);
    var canViewAnyKtp = canViewSensitive(userSession, 'ktp') && (canAccessModule(userSession, 'users') || canAccessModule(userSession, 'adsense'));
    var isKtpDoc = false;
    if (!isSuperAdmin(userSession) && !isOwnKtp) {
      try {
        var adsSh = getAdSenseSheet_();
        if (adsSh && adsSh.getLastRow() > 1) {
          var adsKtps = adsSh.getRange(2, 14, adsSh.getLastRow() - 1, 1).getDisplayValues();
          for (var ai = 0; ai < adsKtps.length; ai++) {
            if ((adsKtps[ai][0] || '').indexOf(fileId) !== -1) { isKtpDoc = true; break; }
          }
        }
        if (!isKtpDoc) {
          var usrSh = getUserSheet_();
          if (usrSh && usrSh.getLastRow() > 1) {
            var usrKtps = usrSh.getRange(2, 10, usrSh.getLastRow() - 1, 1).getDisplayValues();
            for (var ui = 0; ui < usrKtps.length; ui++) {
              if ((usrKtps[ui][0] || '').indexOf(fileId) !== -1) { isKtpDoc = true; break; }
            }
          }
        }
      } catch (eKtpChk) {}
    }

    if (isKtpDoc) {
      if (!isSuperAdmin(userSession) && !isOwnKtp && !canViewAnyKtp) {
        return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat foto KTP privat.' };
      }
    } else if (!isSuperAdmin(userSession) && !canAccessFinance(userSession) && !isOwnKtp && !canViewAnyKtp) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat dokumen privat ini.' };
    }

    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var mime = (blob.getContentType() || '').toLowerCase();
    if (mime.indexOf('image/') !== 0) {
      return { success: false, message: 'Berkas bukan berupa gambar.' };
    }
    var bytes = blob.getBytes();
    if (bytes.length > 5 * 1024 * 1024) {
      return { success: false, message: 'Ukuran pratinjau melebihi 5 MB.' };
    }
    return {
      success: true,
      dataUri: 'data:' + mime + ';base64,' + Utilities.base64Encode(bytes)
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat berkas Drive: ' + err.message };
  }
}

function deleteChannel(id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'channel') || !canPerformModuleAction(userSession, 'channel', 'delete')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus channel.' };
    }

    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    var data = sheet.getRange(2, 1, lastRow - 1, 7).getDisplayValues();
    var globalScope = hasGlobalScope(userSession);
    var uEmail = (userSession.email || '').toLowerCase().trim();
    var uName = (userSession.nama || '').toLowerCase().trim();

    for (var i = 0; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim() === id) {
        if (!globalScope) {
          var owner = (data[i][6] || '').toString().toLowerCase().trim();
          if (owner !== uEmail && owner !== uName) {
            return { success: false, message: 'Akses ditolak: Anda tidak berhak menghapus channel milik orang lain.' };
          }
        }
        sheet.getRange(i + 2, 22).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('Hapus Channel', id, 'Dipindahkan ke Tong Sampah', userSession);
        return { success: true, message: 'Channel berhasil dipindahkan ke Tong Sampah!' };
      }
    }
    return { success: false, message: 'Channel tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus: ' + err.message };
  }
}

/**
 * ================================================================================
 * 📧 MODUL 5: DATABASE EMAIL
 * ================================================================================
 */

function getEmailsData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid atau telah kedaluwarsa.', data: [], items: [], totalPages: 0, totalRecords: 0, totalCount: 0, totalAll: 0, ownersList: [], currentPage: 1, page: 1, limit: 10 };
    }
    if (!canAccessModule(userSession, 'email')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin membuka Database Email.', data: [], items: [], totalPages: 0, totalRecords: 0, totalCount: 0, totalAll: 0, ownersList: [], currentPage: 1, page: 1, limit: 10 };
    }
    if (typeof params === 'string') {
      params = { search: params };
    }
    params = params || {};
    var sheet = getEmailSheet_();
    var lastRow = sheet.getLastRow();
    var limit = Math.max(1, parseInt(params.limit, 10) || 10);
    var page = Math.max(1, parseInt(params.page, 10) || 1);

    if (lastRow <= 1) {
      return { success: true, data: [], items: [], totalPages: 0, totalRecords: 0, totalCount: 0, totalAll: 0, ownersList: [], currentPage: 1, page: 1, limit: limit };
    }

    var superUser = isSuperAdmin(userSession);
    var globalView = hasGlobalScope(userSession);
    var allowCreds = superUser || canViewSensitive(userSession, 'credentials');
    var userEmail = (userSession.email || '').toString().toLowerCase().trim();
    var userName = (userSession.nama || '').toString().toLowerCase().trim();

    var search = (params.search || '').toString().toLowerCase().trim();
    var filterPemilik = (params.pemilik || '').toString().toLowerCase().trim();

    var raw = sheet.getRange(2, 1, lastRow - 1, 10).getDisplayValues();

    // Petakan Channel Terhubung dari DataChannel
    var chSheet = getChannelSheet_();
    var emailChannelsMap = {};
    if (chSheet && chSheet.getLastRow() > 1) {
      var chData = chSheet.getRange(2, 1, chSheet.getLastRow() - 1, 22).getDisplayValues();
      for (var c = 0; c < chData.length; c++) {
        var cId = chData[c][0];
        var cNama = chData[c][2];
        var cLink = chData[c][3];
        var cPemilik = (chData[c][6] || '').toString().toLowerCase().trim();
        var cMonet = chData[c][10];
        var cEmId = (chData[c][20] || '').toString().trim().toLowerCase();
        var cStatusHapus = chData[c][21];
        if (cStatusHapus === 'Deleted') continue;
        if (!globalView && cPemilik !== userEmail && cPemilik !== userName) continue;

        if (cEmId) {
          if (!emailChannelsMap[cEmId]) emailChannelsMap[cEmId] = [];
          emailChannelsMap[cEmId].push({ id: cId, nama: cNama, link: cLink, statusMonet: cMonet });
        }
      }
    }

    var list = [];
    var ownersMap = {};
    var totalAllActive = 0;

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var emId = r[0];
      var alamat = r[1];
      var pass = allowCreds ? r[2] : '🔒 Terbatas';
      var key2fa = allowCreds ? r[3] : '🔒 Terbatas';
      var noHp = r[4];
      var emPemulihan = r[5];
      var kodeCadangan = allowCreds ? r[6] : '';
      var pemilik = r[7];
      var catatan = r[8];
      var statusHapus = r[9] || 'Active';

      if (!emId && !alamat) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      if (!globalView) {
        var pLower = (pemilik || '').toLowerCase().trim();
        if (pLower !== userEmail && pLower !== userName) continue;
      }

      totalAllActive++;
      if (pemilik && pemilik.toString().trim()) {
        ownersMap[pemilik.toString().trim()] = true;
      }

      if (filterPemilik) {
        var pCheck = (pemilik || '').toString().toLowerCase().trim();
        if (pCheck !== filterPemilik) continue;
      }

      if (search) {
        var str = (emId + ' ' + alamat + ' ' + pemilik).toLowerCase();
        if (str.indexOf(search) === -1) continue;
      }

      var connected = emailChannelsMap[emId.toLowerCase()] || emailChannelsMap[alamat.toLowerCase()] || [];

      list.push({
        id: emId,
        email: alamat,
        password: pass,
        autentikator: key2fa,
        kunci2fa: key2fa,
        key2fa: key2fa,
        noHp: noHp,
        nomorPemulihan: noHp,
        emailPemulihan: emPemulihan,
        kodeCadangan: kodeCadangan,
        pemilik: pemilik,
        catatan: catatan,
        credentialsMasked: !allowCreds,
        totalChannels: connected.length,
        connectedChannels: connected
      });
    }

    var ownersList = Object.keys(ownersMap).sort();
    var totalRecords = list.length;
    var totalPages = Math.ceil(totalRecords / limit) || 1;
    if (page > totalPages) page = totalPages;
    var startIdx = (page - 1) * limit;
    var paginated = list.slice(startIdx, startIdx + limit);

    return {
      success: true,
      data: paginated,
      items: paginated,
      totalPages: totalPages,
      totalRecords: totalRecords,
      totalCount: totalRecords,
      totalAll: totalAllActive,
      ownersList: ownersList,
      currentPage: page,
      page: page,
      limit: limit
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat email: ' + err.message };
  }
}

/**
 * Pengambil Kredensial Lengkap Email Berdasarkan Alamat atau ID (1-Klik dari Channel)
 * Diperbaiki agar memetakan 10 kolom DataEmail dengan benar + verifikasi kepemilikan.
 */
function getEmailDetailByAddressOrId(targetQuery, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'email') && !canAccessModule(userSession, 'channel')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat kredensial email.' };
    }

    var q = (targetQuery || '').toString().trim().toLowerCase();
    if (!q) return { success: false, message: 'Alamat atau ID email tidak valid.' };

    var sheet = getEmailSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Database email kosong.' };

    var superUser = isSuperAdmin(userSession);
    var globalView = hasGlobalScope(userSession);
    var allowCreds = superUser || canViewSensitive(userSession, 'credentials');
    var uEmail = (userSession.email || '').toLowerCase().trim();
    var uName = (userSession.nama || '').toLowerCase().trim();

    var raw = sheet.getRange(2, 1, lastRow - 1, 10).getDisplayValues();
    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var id = (r[0] || '').toString().trim();
      var email = (r[1] || '').toString().trim().toLowerCase();
      var pemilik = (r[7] || '').toString().trim();
      var statusHapus = (r[9] || 'Active').toString().trim();

      if (statusHapus.toLowerCase() === 'deleted') continue;

      if (id.toLowerCase() === q || email === q) {
        if (!globalView) {
          var pLower = pemilik.toLowerCase();
          if (pLower !== uEmail && pLower !== uName) {
            return { success: false, message: 'Akses ditolak: Anda tidak berhak melihat kredensial email milik orang lain.' };
          }
        }
        return {
          success: true,
          email: {
            id: r[0],
            email: r[1],
            password: allowCreds ? r[2] : '🔒 Terbatas',
            kunci2fa: allowCreds ? r[3] : '🔒 Terbatas',
            autentikator: allowCreds ? r[3] : '🔒 Terbatas',
            key2fa: allowCreds ? r[3] : '🔒 Terbatas',
            noHp: r[4],
            nomorPemulihan: r[4],
            emailPemulihan: r[5],
            pemulihan: r[5],
            kodeCadangan: allowCreds ? r[6] : '',
            pemilik: r[7],
            catatan: r[8],
            credentialsMasked: !allowCreds,
            statusAkun: 'Aktif'
          }
        };
      }
    }
    return { success: false, message: 'Akun email "' + targetQuery + '" tidak ditemukan dalam database.' };
  } catch (err) {
    return { success: false, message: 'Gagal memuat kredensial email: ' + err.message };
  }
}

function saveEmail(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'email')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin membuka Database Email.' };
    }

    payload = payload || {};
    var sheet = getEmailSheet_();
    var lastRow = sheet.getLastRow();
    var id = (payload.id || '').toString().trim();
    var isEdit = false;
    var targetRow = -1;
    var existingPemilik = '';

    var emailAddr = (payload.email || '').toString().trim();
    if (!emailAddr || emailAddr.indexOf('@') === -1) {
      return { success: false, message: 'Alamat email wajib valid dan mengandung "@".' };
    }

    // Bersihkan kode cadangan Google menjadi format koma rapi
    var rawKode = (payload.kodeCadangan || '').toString().trim();
    var cleanKode = rawKode.split(/[\r\n,]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; }).join(', ');

    if (id && lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 8).getDisplayValues();
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i][0] || '').toString().trim() === id) {
          targetRow = i + 2;
          existingPemilik = (rows[i][7] || '').toString().trim();
          isEdit = true;
          break;
        }
      }
    }

    if (!canPerformModuleAction(userSession, 'email', isEdit ? 'edit' : 'add')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin ' + (isEdit ? 'mengedit' : 'menambah') + ' email.' };
    }

    var superUser = isSuperAdmin(userSession);
    var globalScope = hasGlobalScope(userSession);
    var uEmail = (userSession.email || '').toLowerCase().trim();
    var uName = (userSession.nama || '').toLowerCase().trim();

    if (isEdit && !globalScope) {
      var exLower = existingPemilik.toLowerCase();
      if (exLower !== uEmail && exLower !== uName) {
        return { success: false, message: 'Akses ditolak: Anda tidak berhak mengedit akun email milik orang lain.' };
      }
    }

    if (!isEdit) {
      id = generateId_('EM', sheet);
    }

    var creator = (userSession.nama || userSession.email) || 'Admin';
    var key2fa = (payload.kunci2fa || payload.autentikator || payload.key2fa || '').toString().trim();
    var nomorHp = (payload.nomorPemulihan || payload.noHp || '').toString().trim();
    var pemilik = superUser
      ? ((!isEdit || !payload.pemilik) ? (existingPemilik || creator) : (payload.pemilik || creator).toString().trim())
      : (isEdit ? (existingPemilik || creator) : creator);

    var row = [
      id,
      emailAddr,
      (payload.password || '').trim(),
      key2fa,
      nomorHp,
      (payload.emailPemulihan || '').trim(),
      cleanKode,
      pemilik,
      (payload.catatan || '').trim(),
      'Active'
    ];

    if (isEdit && targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    SpreadsheetApp.flush();
    logActivity_(isEdit ? 'Edit Email' : 'Tambah Email', id, emailAddr, userSession);
    if (!isEdit) {
      recordWorkActivity_(
        userSession,
        'Buat Email',
        '-',
        'Membuat & menyimpan email baru: ' + emailAddr,
        'Otomatis',
        id
      );
    }

    return { success: true, message: 'Akun email berhasil disimpan!', id: id };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan email: ' + err.message };
  }
}

function deleteEmail(id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'email') || !canPerformModuleAction(userSession, 'email', 'delete')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus email.' };
    }

    var sheet = getEmailSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    var globalScope = hasGlobalScope(userSession);
    var uEmail = (userSession.email || '').toLowerCase().trim();
    var uName = (userSession.nama || '').toLowerCase().trim();

    var data = sheet.getRange(2, 1, lastRow - 1, 8).getDisplayValues();
    for (var i = 0; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim() === id) {
        if (!globalScope) {
          var owner = (data[i][7] || '').toString().toLowerCase().trim();
          if (owner !== uEmail && owner !== uName) {
            return { success: false, message: 'Akses ditolak: Anda tidak berhak menghapus akun email milik orang lain.' };
          }
        }
        sheet.getRange(i + 2, 10).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('Hapus Email', id, 'Dipindahkan ke Tong Sampah', userSession);
        return { success: true, message: 'Akun email berhasil dipindahkan ke Tong Sampah!' };
      }
    }
    return { success: false, message: 'Email tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🛡️ MODUL 6: DATABASE ADSENSE (DAPAT DIATUR READ-ONLY / PENUH VIA GRANULAR RBAC)
 * ================================================================================
 */

function getAdSenseData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return { success: false, authExpired: true, message: 'Sesi tidak valid.', data: [], items: [] };
    }
    if (!canAccessModule(userSession, 'adsense')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat Database AdSense.', data: [] };
    }
    var superUser = isSuperAdmin(userSession);
    var allowCreds = superUser || canViewSensitive(userSession, 'credentials');
    var allowKtp = superUser || canViewSensitive(userSession, 'ktp');

    params = params || {};
    var sheet = getAdSenseSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [], totalPages: 0, totalRecords: 0, currentPage: 1 };
    }

    var page = Math.max(1, parseInt(params.page, 10) || 1);
    var limit = Math.max(1, parseInt(params.limit, 10) || 10);
    var search = (params.search || '').toString().toLowerCase().trim();

    var raw = sheet.getRange(2, 1, lastRow - 1, 16).getDisplayValues();
    var list = [];

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var recId = r[0];
      var pubId = r[1];
      var email = r[2];
      var pass = allowCreds ? r[3] : '🔒 Terbatas';
      var key2fa = allowCreds ? r[4] : '🔒 Terbatas';
      var emPemulihan = r[5];
      var noHp = r[6];
      var namaKtp = r[7];
      var bank = r[8];
      var noRek = r[9];
      var atasNama = r[10];
      var statusPin = r[11];
      var statusVerif = r[12];
      var fotoKtp = allowKtp ? r[13] : '';
      var statusHapus = r[15] || 'Active';

      if (!recId && !pubId) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      if (search) {
        var str = (recId + ' ' + pubId + ' ' + email + ' ' + namaKtp).toLowerCase();
        if (str.indexOf(search) === -1) continue;
      }

      list.push({
        id: recId,
        pubId: pubId,
        email: email,
        password: pass,
        autentikator: key2fa,
        kunci2fa: key2fa,
        emailPemulihan: emPemulihan,
        noHp: noHp,
        noPemulihan: noHp,
        namaKtp: namaKtp,
        bank: bank,
        noRekening: noRek,
        atasNama: atasNama,
        statusPin: statusPin,
        statusKtp: statusVerif,
        statusVerifikasi: statusVerif,
        fotoKtpUrl: fotoKtp,
        credentialsMasked: !allowCreds
      });
    }

    var totalRecords = list.length;
    var totalPages = Math.ceil(totalRecords / limit) || 1;
    if (page > totalPages) page = totalPages;
    var startIdx = (page - 1) * limit;
    var paginated = list.slice(startIdx, startIdx + limit);

    return {
      success: true,
      data: paginated,
      items: paginated,
      totalPages: totalPages,
      totalRecords: totalRecords,
      totalCount: totalRecords,
      currentPage: page,
      page: page
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat AdSense: ' + err.message };
  }
}

function saveAdSense(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'adsense')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengelola Database AdSense.' };
    }

    payload = payload || {};
    var pubId = (payload.pubId || '').toString().trim();
    var email = (payload.email || '').toString().trim();
    if (!pubId && !email) {
      return { success: false, message: 'Publisher ID atau Email AdSense wajib diisi.' };
    }

    var sheet = getAdSenseSheet_();
    var lastRow = sheet.getLastRow();
    var id = (payload.id || '').toString().trim();
    var isEdit = false;
    var targetRow = -1;
    var existingFolderDriveId = '';

    if (id && lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 15).getDisplayValues();
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i][0] || '').toString().trim() === id) {
          targetRow = i + 2;
          existingFolderDriveId = rows[i][14] || '';
          isEdit = true;
          break;
        }
      }
    }

    if (!canPerformModuleAction(userSession, 'adsense', isEdit ? 'edit' : 'add')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin ' + (isEdit ? 'mengubah' : 'menambah') + ' data AdSense.' };
    }

    if (!isEdit) {
      id = generateId_('ADS', sheet);
    }

    var key2fa = (payload.autentikator || payload.kunci2fa || '').toString().trim();
    var noHp = (payload.noHp || payload.noPemulihan || '').toString().trim();
    var statusVerif = (payload.statusKtp || payload.statusVerifikasi || 'Pending').toString().trim();

    var row = [
      id,
      pubId,
      email,
      (payload.password || '').trim(),
      key2fa,
      (payload.emailPemulihan || '').trim(),
      noHp,
      (payload.namaKtp || '').trim(),
      (payload.bank || '').trim(),
      (payload.noRekening || '').trim(),
      (payload.atasNama || '').trim(),
      payload.statusPin || 'Belum PIN',
      statusVerif,
      payload.fotoKtpUrl || '',
      existingFolderDriveId, // Pertahankan Folder_Drive_ID saat edit
      'Active'
    ];

    if (isEdit && targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    SpreadsheetApp.flush();
    logActivity_(isEdit ? 'Edit AdSense' : 'Tambah AdSense', id, pubId || email, userSession);

    return { success: true, message: 'Akun AdSense berhasil disimpan!', id: id };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan AdSense: ' + err.message };
  }
}

function deleteAdSense(id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'adsense') || !canPerformModuleAction(userSession, 'adsense', 'delete')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus data AdSense.' };
    }
    var sheet = getAdSenseSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if ((ids[i][0] || '').toString().trim() === id) {
        sheet.getRange(i + 2, 16).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('Hapus AdSense', id, 'Dipindahkan ke Tong Sampah', userSession);
        return { success: true, message: 'Data AdSense berhasil dipindahkan ke Tong Sampah!' };
      }
    }
    return { success: false, message: 'Data tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus: ' + err.message };
  }
}

/**
 * ================================================================================
 * 💰 MODUL 8: KEUANGAN STUDIO (BUKU KAS HARIAN)
 * ================================================================================
 */

/**
 * Universal Currency & Number Parser (REV-10.10)
 * Menangani raw numeric, format bertitik rupiah (20.000.000 / Rp 20.000.000), koma internasional (20,000,000), desimal, dan prefix mata uang.
 */
function parseNominalAmount(val, displayVal) {
  if (typeof val === 'number' && !isNaN(val)) return Math.abs(val);
  var s = (displayVal !== undefined && displayVal !== null && displayVal !== '') 
    ? displayVal.toString().trim() 
    : (val ? val.toString().trim() : '');
  if (!s) return 0;

  // Bersihkan prefix Rupiah dan whitespace
  s = s.replace(/^(rp\.?|idr)\s*/i, '').replace(/\s+/g, '');

  if (s.indexOf('.') > -1 && s.indexOf(',') > -1) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // 20.000.000,00 -> titik adalah ribuan, koma adalah desimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // 20,000,000.00 -> koma adalah ribuan, titik adalah desimal
      s = s.replace(/,/g, '');
    }
  } else if (s.indexOf('.') > -1) {
    // Format bertitik: 20.000.000 atau 20.000
    var parts = s.split('.');
    if (parts.length > 2) {
      // Banyak titik (misal 20.000.000) -> 100% pemisah ribuan
      s = s.replace(/\./g, '');
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        // Tepat 3 digit di belakang titik -> ribuan
        s = parts[0] + parts[1];
      }
    }
  } else if (s.indexOf(',') > -1) {
    var parts = s.split(',');
    if (parts.length > 2) {
      s = s.replace(/,/g, '');
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        s = parts[0] + parts[1];
      } else {
        s = parts[0] + '.' + parts[1];
      }
    }
  }

  s = s.replace(/[^0-9.-]/g, '');
  var num = parseFloat(s);
  return isNaN(num) ? 0 : Math.abs(num);
}

function normalizeDateBackend(str) {
  if (!str) return '';
  var s = str.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var pSlash = s.split(' ')[0].split('/');
  if (pSlash.length === 3) {
    var d = ('0' + pSlash[0]).slice(-2);
    var m = ('0' + pSlash[1]).slice(-2);
    var y = pSlash[2].length === 2 ? ('20' + pSlash[2]) : pSlash[2];
    return y + '-' + m + '-' + d;
  }
  var pDash = s.split(' ')[0].split('-');
  if (pDash.length === 3 && pDash[0].length <= 2) {
    var d2 = ('0' + pDash[0]).slice(-2);
    var m2 = ('0' + pDash[1]).slice(-2);
    var y2 = pDash[2].length === 2 ? ('20' + pDash[2]) : pDash[2];
    return y2 + '-' + m2 + '-' + d2;
  }
  return s;
}

function getFinanceData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) {
      return {
        success: false,
        authExpired: true,
        message: 'Sesi tidak valid atau telah kedaluwarsa.',
        data: [], items: [], totalPemasukan: 0, totalPengeluaran: 0, saldoBersih: 0, sisaSaldo: 0,
        rasioPemasukan: 50, rasioPengeluaran: 50, topExpenses: [], categories: []
      };
    }
    if (!canAccessFinance(userSession)) {
      return {
        success: false,
        message: 'Akses ditolak: Anda tidak memiliki izin mengakses Keuangan Studio.',
        data: [],
        items: [],
        totalPemasukan: 0,
        totalPengeluaran: 0,
        saldoBersih: 0,
        sisaSaldo: 0,
        rasioPemasukan: 50,
        rasioPengeluaran: 50,
        topExpenses: [],
        categories: []
      };
    }
    params = params || {};
    var sheet = getFinanceSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        data: [],
        items: [],
        totalPemasukan: 0,
        totalPengeluaran: 0,
        saldoBersih: 0,
        sisaSaldo: 0,
        rasioPemasukan: 50,
        rasioPengeluaran: 50,
        topExpenses: [],
        categories: []
      };
    }

    var raw = sheet.getRange(2, 1, lastRow - 1, 11).getDisplayValues();
    var rawValues = sheet.getRange(2, 6, lastRow - 1, 1).getValues(); // Raw numeric kolom Nominal (F)
    var search = (params.search || '').toString().toLowerCase().trim();
    var filterTipe = (params.tipe || 'ALL').toString().trim().toUpperCase();
    var filterPeriode = (params.periode || 'ALL').toString().trim().toLowerCase();

    var list = [];
    var totalPemasukan = 0;
    var totalPengeluaran = 0;
    var categoryExpenses = {};
    var now = new Date();
    var curYear = parseInt(Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy'), 10);
    var curMonthNum = parseInt(Utilities.formatDate(now, 'Asia/Jakarta', 'MM'), 10);
    var curMonth = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');
    var prevMonthNum = curMonthNum === 1 ? 12 : curMonthNum - 1;
    var prevYearNum = curMonthNum === 1 ? curYear - 1 : curYear;
    var prevMonth = prevYearNum + '-' + ('0' + prevMonthNum).slice(-2);
    var todayStr = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd');

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var id = (r[0] || '').toString().trim();
      var tgl = (r[1] || '').toString().trim();
      var deskripsi = (r[2] || '').toString().trim();
      var kat = (r[3] || 'Lain-lain').toString().trim();
      var tipeRaw = (r[4] || '').toString().trim();
      var tipe = tipeRaw.toLowerCase() === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
      var nominal = parseNominalAmount(rawValues[i] ? rawValues[i][0] : null, r[5]);
      var buktiNota = r[6];
      var fotoBarang = r[7];
      var dicatatOleh = r[8];
      var statusHapus = (r[10] || 'Active').toString().trim();

      if (!id && !tgl && nominal === 0) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;

      // Auto-healer: jika baris lama belum punya ID di kolom A, buatkan ID dan simpan ke sheet
      if (!id) {
        id = generateId_('TRX', sheet);
        sheet.getRange(i + 2, 1).setValue(id);
      }

      // Normalisasi tanggal untuk filter periode & Top Expenses bulan ini
      var tglNorm = normalizeDateBackend(tgl);

      if (tipe === 'Pemasukan') {
        totalPemasukan += nominal;
      } else {
        totalPengeluaran += nominal;
        if (tglNorm.indexOf(curMonth) === 0 || tgl.indexOf(curMonth) !== -1 || tgl.indexOf(curMonth.replace('-', '/')) !== -1) {
          categoryExpenses[kat] = (categoryExpenses[kat] || 0) + nominal;
        }
      }

      // Filter Periode
      var matchPeriode = true;
      if (filterPeriode === 'today') {
        matchPeriode = (tglNorm === todayStr || tgl === todayStr);
      } else if (filterPeriode === 'this_month') {
        matchPeriode = (tglNorm.indexOf(curMonth) === 0 || tgl.indexOf(curMonth) === 0);
      } else if (filterPeriode === 'last_month') {
        matchPeriode = (tglNorm.indexOf(prevMonth) === 0 || tgl.indexOf(prevMonth) === 0);
      } else if (filterPeriode === 'this_year') {
        matchPeriode = (tglNorm.indexOf(String(curYear)) === 0 || tgl.indexOf(String(curYear)) === 0);
      }

      var matchSearch = !search ||
        id.toLowerCase().indexOf(search) !== -1 ||
        deskripsi.toLowerCase().indexOf(search) !== -1 ||
        kat.toLowerCase().indexOf(search) !== -1 ||
        (dicatatOleh || '').toLowerCase().indexOf(search) !== -1;

      var matchTipe = (filterTipe === 'ALL' || filterTipe === '') || (tipe.toUpperCase() === filterTipe);

      if (matchSearch && matchTipe && matchPeriode) {
        list.push({
          id: id,
          rowIndex: i + 2,
          tanggal: tgl,
          tanggalIso: tglNorm,
          deskripsi: deskripsi,
          kategori: kat,
          tipe: tipe,
          nominal: nominal,
          buktiNotaUrl: buktiNota,
          buktiUrl: buktiNota,
          fotoBarangUrl: fotoBarang,
          dicatatOleh: dicatatOleh || 'Admin',
          dibuatOleh: dicatatOleh || 'Admin'
        });
      }
    }

    list.reverse(); // Terbaru di atas
    var saldoBersih = totalPemasukan - totalPengeluaran;
    var totalFlow = totalPemasukan + totalPengeluaran;
    var rasioIn = totalFlow > 0 ? Math.round((totalPemasukan / totalFlow) * 100) : 50;
    var rasioOut = 100 - rasioIn;

    // Top 3 Pengeluaran Terbesar Bulan Ini
    var topExpenses = [];
    for (var cat in categoryExpenses) {
      topExpenses.push({ kategori: cat, nominal: categoryExpenses[cat] });
    }
    topExpenses.sort(function(a, b) { return b.nominal - a.nominal; });
    topExpenses = topExpenses.slice(0, 3);

    // Dynamic Categories
    var categoriesList = [];
    try {
      var katSheet = getKategoriFinanceSheet_();
      var katLast = katSheet.getLastRow();
      if (katLast > 1) {
        var kData = katSheet.getRange(2, 1, katLast - 1, 4).getDisplayValues();
        for (var ki = 0; ki < kData.length; ki++) {
          if (kData[ki][1]) {
            categoriesList.push({
              id: kData[ki][0],
              nama: kData[ki][1],
              tipe: kData[ki][2] || 'Pengeluaran'
            });
          }
        }
      }
    } catch (e) {}

    return {
      success: true,
      data: list,
      items: list,
      totalPemasukan: totalPemasukan,
      totalPengeluaran: totalPengeluaran,
      saldoBersih: saldoBersih,
      sisaSaldo: saldoBersih,
      rasioPemasukan: rasioIn,
      rasioPengeluaran: rasioOut,
      topExpenses: topExpenses,
      categories: categoriesList
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat keuangan: ' + err.message };
  }
}

function saveFinanceTransaction(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid' };
    if (!canAccessFinance(userSession)) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengelola Keuangan Studio.' };
    payload = payload || {};
    var sheet = getFinanceSheet_();
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var id = (payload.id || '').trim();
    var tanggal = (payload.tanggal || '').trim() || Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
    var deskripsi = (payload.deskripsi || '').trim();
    var kategori = (payload.kategori || '').trim();
    var tipeRaw = (payload.tipe || 'Pengeluaran').trim();
    var tipe = tipeRaw.toLowerCase() === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    var nominal = parseNominalAmount(payload.nominal);
    var buktiNota = (payload.buktiNotaUrl || payload.buktiUrl || payload.bukti || '').trim();
    var fotoBarang = (payload.fotoBarangUrl || payload.fotoBarang || '').trim();
    var creator = userSession.nama || userSession.email || 'Admin';

    if (!deskripsi) return { success: false, message: 'Deskripsi transaksi wajib diisi' };
    if (nominal <= 0) return { success: false, message: 'Nominal wajib lebih dari 0' };

    var lastRow = sheet.getLastRow();
    var foundIndex = -1;
    if (id && lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === id) {
          foundIndex = i + 2;
          break;
        }
      }
    }

    if (!canPerformModuleAction(userSession, 'finance', foundIndex !== -1 ? 'edit' : 'add')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin ' + (foundIndex !== -1 ? 'mengubah' : 'menambah') + ' transaksi keuangan.' };
    }

    if (foundIndex !== -1) {
      sheet.getRange(foundIndex, 2, 1, 7).setValues([[
        tanggal, deskripsi, kategori, tipe, nominal, buktiNota, fotoBarang
      ]]);
      SpreadsheetApp.flush();
      logActivity_('UPDATE_FINANCE', id, 'Update transaksi: ' + deskripsi + ' (' + tipe + ' ' + nominal + ')', userSession);
      return { success: true, message: 'Transaksi berhasil diperbarui', id: id };
    } else {
      id = generateId_('TRX', sheet);
      var row = [id, tanggal, deskripsi, kategori, tipe, nominal, buktiNota, fotoBarang, creator, nowStr, 'Active'];
      sheet.appendRow(row);
      SpreadsheetApp.flush();
      logActivity_('CREATE_FINANCE', id, 'Catat transaksi baru: ' + deskripsi + ' (' + tipe + ' ' + nominal + ')', userSession);
      return { success: true, message: 'Transaksi baru berhasil dicatat', id: id };
    }
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan transaksi: ' + err.message };
  }
}

function deleteFinance(id, userSession, rowIndex) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid' };
    if (!canAccessFinance(userSession)) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus transaksi Keuangan Studio.' };
    if (!canPerformModuleAction(userSession, 'finance', 'delete')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus transaksi keuangan.' };
    var sheet = getFinanceSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };
    
    var foundRow = -1;
    var targetId = (id || '').toString().trim();
    if (targetId) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === targetId) {
          foundRow = i + 2;
          break;
        }
      }
    }

    // Fallback presisi: jika ID belum tercatat atau kosong, gunakan rowIndex
    if (foundRow === -1 && rowIndex) {
      var rIdx = parseInt(rowIndex, 10);
      if (!isNaN(rIdx) && rIdx >= 2 && rIdx <= lastRow) {
        foundRow = rIdx;
      }
    }

    if (foundRow !== -1) {
      sheet.getRange(foundRow, 11).setValue('Deleted');
      SpreadsheetApp.flush();
      logActivity_('DELETE_FINANCE', targetId || ('ROW_' + foundRow), 'Hapus transaksi keuangan ke tong sampah', userSession);
      return { success: true, message: 'Transaksi berhasil dipindahkan ke Tong Sampah' };
    }
    return { success: false, message: 'ID transaksi tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus transaksi: ' + err.message };
  }
}

function addFinanceCategory(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid' };
    if (!canAccessFinance(userSession) || !canPerformModuleAction(userSession, 'finance', 'add')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menambah kategori keuangan.' };
    }
    payload = payload || {};
    var sheet = getKategoriFinanceSheet_();
    var nama = (payload.nama || '').trim();
    var tipeRaw = (payload.tipe || 'Pengeluaran').trim();
    var tipe = tipeRaw.toLowerCase() === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    var creator = userSession.nama || userSession.email || 'Admin';
    if (!nama) return { success: false, message: 'Nama kategori wajib diisi' };

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existing = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
      var nLower = nama.toLowerCase();
      for (var i = 0; i < existing.length; i++) {
        if ((existing[i][0] || '').toString().trim().toLowerCase() === nLower) {
          return { success: false, message: 'Kategori "' + nama + '" sudah ada.' };
        }
      }
    }

    var id = generateId_('CAT', sheet);
    sheet.appendRow([id, nama, tipe, creator]);
    SpreadsheetApp.flush();
    logActivity_('CREATE_FINANCE_CATEGORY', id, 'Tambah kategori: ' + nama + ' (' + tipe + ')', userSession);
    return { success: true, message: 'Kategori berhasil ditambahkan', id: id };
  } catch (err) {
    return { success: false, message: 'Gagal menambah kategori: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🎓 MODUL 9: MATERI EDUKASI (IN-APP VIDEO PLAYER & CURRICULUM)
 * ================================================================================
 */

function getMateriList(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.', data: [], items: [] };
    if (!canAccessModule(userSession, 'materi')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin membuka Materi Edukasi.', data: [], items: [] };
    }

    var sheet = getMateriSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [], items: [] };
    }
    var raw = sheet.getRange(2, 1, lastRow - 1, 7).getDisplayValues();
    var list = [];
    var isSuper = isSuperAdmin(userSession);
    var allowedIds = null;
    if (!isSuper && userSession.izinAkses && userSession.izinAkses.allMateri === false) {
      allowedIds = new Set(Array.isArray(userSession.izinAkses.allowedMateriIds) ? userSession.izinAkses.allowedMateriIds : []);
    }

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var id = r[0];
      var judul = r[1];
      var kat = r[2];
      var link = r[3];
      var desc = r[4];
      var tgl = r[5];
      var statusHapus = r[6] || 'Active';

      if (!id && !judul) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;
      if (allowedIds && !allowedIds.has(id)) continue;

      list.push({
        id: id,
        judul: judul,
        title: judul,
        kategori: kat,
        category: kat,
        linkVideo: link,
        videoUrl: link,
        deskripsi: desc,
        description: desc,
        tanggalRilis: tgl,
        releaseDate: tgl
      });
    }
    return { success: true, data: list, items: list };
  } catch (err) {
    return { success: false, message: 'Gagal memuat materi: ' + err.message };
  }
}

function saveMateriItem(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'materi', 'add')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengelola Materi Edukasi.' };
    payload = payload || {};
    var sheet = getMateriSheet_();
    var id = (payload.id || '').trim();
    var judul = (payload.judul || payload.title || '').trim();
    var kat = (payload.kategori || payload.category || 'Dasar').trim();
    var link = (payload.link || payload.linkVideo || payload.url || payload.videoUrl || '').trim();
    var desc = (payload.deskripsi || payload.description || '').trim();
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');

    if (!judul) return { success: false, message: 'Judul materi wajib diisi' };
    if (!link) return { success: false, message: 'Link video YouTube wajib diisi' };
    if (!/^https?:\/\//i.test(link)) return { success: false, message: 'URL video harus diawali http:// atau https://' };

    var lastRow = sheet.getLastRow();
    var foundIndex = -1;
    if (id && lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === id) {
          foundIndex = i + 2;
          break;
        }
      }
    }

    if (foundIndex !== -1) {
      sheet.getRange(foundIndex, 2, 1, 4).setValues([[judul, kat, link, desc]]);
      SpreadsheetApp.flush();
      logActivity_('UPDATE_MATERI', id, 'Update materi: ' + judul, userSession);
      return { success: true, message: 'Materi berhasil diperbarui', id: id };
    } else {
      id = generateId_('MAT', sheet);
      sheet.appendRow([id, judul, kat, link, desc, nowStr, 'Active']);
      SpreadsheetApp.flush();
      logActivity_('CREATE_MATERI', id, 'Tambah materi: ' + judul, userSession);
      return { success: true, message: 'Materi berhasil ditambahkan', id: id };
    }
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan materi: ' + err.message };
  }
}

function deleteMateriItem(id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'materi', 'delete')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus Materi Edukasi.' };
    var sheet = getMateriSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        var rowIndex = i + 2;
        sheet.getRange(rowIndex, 7).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('DELETE_MATERI', id, 'Hapus materi ke tong sampah', userSession);
        return { success: true, message: 'Materi berhasil dihapus' };
      }
    }
    return { success: false, message: 'ID materi tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus materi: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🛠️ MODUL 10: TOOLS STUDIO (GEMINI CANVAS & IN-APP WORKSPACE)
 * ================================================================================
 */

function getToolsList(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.', data: [], items: [] };
    if (!canAccessModule(userSession, 'tools')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin membuka Tools Studio.', data: [], items: [] };
    }

    var sheet = getToolsSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, data: [], items: [] };
    }
    var raw = sheet.getRange(2, 1, lastRow - 1, 8).getDisplayValues();
    var list = [];
    var isSuper = isSuperAdmin(userSession);
    var allowedIds = null;
    if (!isSuper && userSession.izinAkses && userSession.izinAkses.allTools === false) {
      allowedIds = new Set(Array.isArray(userSession.izinAkses.allowedToolIds) ? userSession.izinAkses.allowedToolIds : []);
    }

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var id = r[0];
      var nama = r[1];
      var kat = r[2];
      var tipe = r[3];
      var url = r[4];
      var desc = r[5];
      var ikon = r[6] || 'fa-solid fa-screwdriver-wrench';
      var statusHapus = r[7] || 'Active';

      if (!id && !nama) continue;
      if (statusHapus.toLowerCase() === 'deleted') continue;
      if (allowedIds && !allowedIds.has(id)) continue;

      list.push({
        id: id,
        nama: nama,
        name: nama,
        kategori: kat,
        category: kat,
        tipePeluncuran: tipe,
        tipe: tipe,
        urlTool: url,
        url: url,
        deskripsi: desc,
        description: desc,
        ikon: ikon,
        icon: ikon
      });
    }
    return { success: true, data: list, items: list };
  } catch (err) {
    return { success: false, message: 'Gagal memuat tools: ' + err.message };
  }
}

function saveToolItem(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'tools', 'add')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mengelola Tools Studio.' };
    payload = payload || {};
    var sheet = getToolsSheet_();
    var id = (payload.id || '').trim();
    var nama = (payload.nama || payload.name || '').trim();
    var kat = (payload.kategori || payload.category || 'AI Tools').trim();
    var tipe = (payload.tipe || payload.tipePeluncuran || 'In-App Workspace').trim();
    var url = (payload.url || payload.urlTool || '').trim();
    var desc = (payload.deskripsi || payload.description || '').trim();
    var ikon = (payload.ikon || payload.icon || 'fa-solid fa-wand-magic-sparkles').trim();

    if (!nama) return { success: false, message: 'Nama tool wajib diisi' };
    if (!url) return { success: false, message: 'URL tool wajib diisi' };
    if (!/^https?:\/\//i.test(url)) return { success: false, message: 'URL tool harus diawali http:// atau https://' };

    var lastRow = sheet.getLastRow();
    var foundIndex = -1;
    if (id && lastRow > 1) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === id) {
          foundIndex = i + 2;
          break;
        }
      }
    }

    if (foundIndex !== -1) {
      sheet.getRange(foundIndex, 2, 1, 6).setValues([[nama, kat, tipe, url, desc, ikon]]);
      SpreadsheetApp.flush();
      logActivity_('UPDATE_TOOL', id, 'Update tool: ' + nama, userSession);
      return { success: true, message: 'Tool berhasil diperbarui', id: id };
    } else {
      id = generateId_('TOL', sheet);
      sheet.appendRow([id, nama, kat, tipe, url, desc, ikon, 'Active']);
      SpreadsheetApp.flush();
      logActivity_('CREATE_TOOL', id, 'Tambah tool: ' + nama, userSession);
      return { success: true, message: 'Tool baru berhasil ditambahkan', id: id };
    }
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan tool: ' + err.message };
  }
}

function deleteToolItem(id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'tools', 'delete')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus Tools Studio.' };
    var sheet = getToolsSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        var rowIndex = i + 2;
        sheet.getRange(rowIndex, 8).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('DELETE_TOOL', id, 'Hapus tool ke tong sampah', userSession);
        return { success: true, message: 'Tool berhasil dihapus' };
      }
    }
    return { success: false, message: 'ID tool tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus tool: ' + err.message };
  }
}

/**
 * ================================================================================
 * 🗑️ SISTEM TONG SAMPAH (RESTORE & PERMANENT DELETE)
 * ================================================================================
 */

function getTrashBinData(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canAccessModule(userSession, 'trash')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin melihat Tong Sampah.' };
    var trash = [];

    // 1. Channel
    try {
      var chSheet = getChannelSheet_();
      var chLast = chSheet.getLastRow();
      if (chLast > 1) {
        var chData = chSheet.getRange(2, 1, chLast - 1, 22).getDisplayValues();
        for (var i = 0; i < chData.length; i++) {
          if ((chData[i][21] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: chData[i][0],
              module: 'Channel',
              name: chData[i][2] || chData[i][0],
              details: 'Channel: ' + (chData[i][2] || '-') + ' | Sub: ' + (chData[i][4] || '0')
            });
          }
        }
      }
    } catch (e) {}

    // 2. Email
    try {
      var emSheet = getEmailSheet_();
      var emLast = emSheet.getLastRow();
      if (emLast > 1) {
        var emData = emSheet.getRange(2, 1, emLast - 1, 10).getDisplayValues();
        for (var i = 0; i < emData.length; i++) {
          if ((emData[i][9] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: emData[i][0],
              module: 'Email',
              name: emData[i][1] || emData[i][0],
              details: 'Email: ' + (emData[i][1] || '-') + ' | Pemilik: ' + (emData[i][7] || '-')
            });
          }
        }
      }
    } catch (e) {}

    // 3. AdSense
    try {
      var adsSheet = getAdSenseSheet_();
      var adsLast = adsSheet.getLastRow();
      if (adsLast > 1) {
        var adsData = adsSheet.getRange(2, 1, adsLast - 1, 16).getDisplayValues();
        for (var i = 0; i < adsData.length; i++) {
          if ((adsData[i][15] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: adsData[i][0],
              module: 'AdSense',
              name: adsData[i][1] || adsData[i][2] || adsData[i][0],
              details: 'PUB: ' + (adsData[i][1] || '-') + ' | KTP: ' + (adsData[i][7] || '-')
            });
          }
        }
      }
    } catch (e) {}

    // 4. Keuangan
    try {
      var finSheet = getFinanceSheet_();
      var finLast = finSheet.getLastRow();
      if (finLast > 1) {
        var finData = finSheet.getRange(2, 1, finLast - 1, 11).getDisplayValues();
        for (var i = 0; i < finData.length; i++) {
          if ((finData[i][10] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: finData[i][0],
              module: 'Keuangan',
              name: finData[i][2] || finData[i][0],
              details: finData[i][4] + ' Rp ' + finData[i][5] + ' (' + finData[i][3] + ')'
            });
          }
        }
      }
    } catch (e) {}

    // 5. Materi
    try {
      var matSheet = getMateriSheet_();
      var matLast = matSheet.getLastRow();
      if (matLast > 1) {
        var matData = matSheet.getRange(2, 1, matLast - 1, 7).getDisplayValues();
        for (var i = 0; i < matData.length; i++) {
          if ((matData[i][6] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: matData[i][0],
              module: 'Materi',
              name: matData[i][1] || matData[i][0],
              details: 'Video: ' + (matData[i][1] || '-') + ' (' + (matData[i][2] || '-') + ')'
            });
          }
        }
      }
    } catch (e) {}

    // 6. Tools
    try {
      var tolSheet = getToolsSheet_();
      var tolLast = tolSheet.getLastRow();
      if (tolLast > 1) {
        var tolData = tolSheet.getRange(2, 1, tolLast - 1, 8).getDisplayValues();
        for (var i = 0; i < tolData.length; i++) {
          if ((tolData[i][7] || '').toLowerCase() === 'deleted') {
            trash.push({
              id: tolData[i][0],
              module: 'Tools',
              name: tolData[i][1] || tolData[i][0],
              details: 'Tool: ' + (tolData[i][1] || '-') + ' (' + (tolData[i][2] || '-') + ')'
            });
          }
        }
      }
    } catch (e) {}

    return { success: true, data: trash, items: trash };
  } catch (err) {
    return { success: false, message: 'Gagal memuat tong sampah: ' + err.message };
  }
}

function restoreTrashItem(module, id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'trash', 'edit')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin memulihkan data dari Tong Sampah.' };
    var sheet = null;
    var statusCol = -1;

    var mod = (module || '').toLowerCase();
    if (mod === 'channel') { sheet = getChannelSheet_(); statusCol = 22; }
    else if (mod === 'email') { sheet = getEmailSheet_(); statusCol = 10; }
    else if (mod === 'adsense') { sheet = getAdSenseSheet_(); statusCol = 16; }
    else if (mod === 'keuangan' || mod === 'finance') { sheet = getFinanceSheet_(); statusCol = 11; }
    else if (mod === 'materi') { sheet = getMateriSheet_(); statusCol = 7; }
    else if (mod === 'tool' || mod === 'tools') { sheet = getToolsSheet_(); statusCol = 8; }

    if (!sheet) return { success: false, message: 'Modul tidak dikenali' };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        sheet.getRange(i + 2, statusCol).setValue('Active');
        SpreadsheetApp.flush();
        logActivity_('RESTORE_TRASH', id, 'Pulihkan item ' + module + ' dari tong sampah', userSession);
        return { success: true, message: 'Data ' + module + ' (' + id + ') berhasil dipulihkan' };
      }
    }
    return { success: false, message: 'ID tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal memulihkan: ' + err.message };
  }
}

function permanentDeleteTrashItem(module, id, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'trash', 'delete')) return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus permanen data dari Tong Sampah.' };
    var sheet = null;

    var mod = (module || '').toLowerCase();
    if (mod === 'channel') sheet = getChannelSheet_();
    else if (mod === 'email') sheet = getEmailSheet_();
    else if (mod === 'adsense') sheet = getAdSenseSheet_();
    else if (mod === 'keuangan' || mod === 'finance') sheet = getFinanceSheet_();
    else if (mod === 'materi') sheet = getMateriSheet_();
    else if (mod === 'tool' || mod === 'tools') sheet = getToolsSheet_();

    if (!sheet) return { success: false, message: 'Modul tidak dikenali' };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        sheet.deleteRow(i + 2);
        SpreadsheetApp.flush();
        logActivity_('PERMANENT_DELETE', id, 'Hapus permanen item ' + module + ' dari database', userSession);
        return { success: true, message: 'Data ' + module + ' (' + id + ') berhasil dihapus PERMANEN' };
      }
    }
    return { success: false, message: 'ID tidak ditemukan' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus permanen: ' + err.message };
  }
}

/**
 * ================================================================================
 * 📊 MODUL 12: LAPORAN KERJA HARIAN & PENGUMPUL OTOMATIS 23:00 WIB KE OWNER (REV-10.20)
 * ================================================================================
 */

function escapeEmailHtml_(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTodayDateYmdWIB(offsetDays) {
  var dt = new Date(Date.now() + ((offsetDays || 0) * 24 * 60 * 60 * 1000));
  return Utilities.formatDate(dt, 'Asia/Jakarta', 'yyyy-MM-dd');
}

function normalizeWorkDateYmd_(raw) {
  var s = (raw || '').toString().trim();
  if (!s) return getTodayDateYmdWIB(0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var mDmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mDmy) {
    return mDmy[3] + '-' + ('0' + mDmy[2]).slice(-2) + '-' + ('0' + mDmy[1]).slice(-2);
  }
  return getTodayDateYmdWIB(0);
}

function normalizeWorkCategory_(rawCat) {
  var s = (rawCat || '').toString().trim().toLowerCase();
  if (!s) return '';
  if (s === 'buat email' || s.indexOf('email') > -1) return 'Buat Email';
  if (s === 'buat channel' || s.indexOf('channel') > -1 || s.indexOf('chanel') > -1) return 'Buat Channel';
  if (s === 'cari / buat bahan' || s.indexOf('bahan') > -1 || s.indexOf('riset') > -1 || s.indexOf('script') > -1 || s.indexOf('aset') > -1 || s.indexOf('materi') > -1) {
    return 'Cari / Buat Bahan';
  }
  if (s === 'mengedit' || s.indexOf('edit') > -1) return 'Mengedit';
  if (s === 'upload' || s.indexOf('upload') > -1) return 'Upload';
  if (s === 'menjadwalkan' || s.indexOf('jadwal') > -1 || s.indexOf('schedule') > -1) return 'Menjadwalkan';
  return '';
}

function createEmptyCategoryCounts_() {
  var counts = {};
  for (var i = 0; i < WORK_REPORT_CATEGORIES.length; i++) {
    counts[WORK_REPORT_CATEGORIES[i]] = 0;
  }
  return counts;
}

/**
 * Pencatat Aktivitas Kerja Resmi (Timestamp Server WIB Anti-Manipulasi)
 */
function recordWorkActivity_(userSession, kategori, channelTerkait, keterangan, sumber, refId) {
  try {
    var verified = authenticateSession(userSession) || userSession;
    if (!verified || (!verified.email && !verified.nama && !verified.id)) {
      return { success: false, message: 'Identitas pengguna tidak valid.' };
    }
    var normCat = normalizeWorkCategory_(kategori);
    if (!normCat) {
      return { success: false, message: 'Kategori aktivitas tidak valid.' };
    }

    var sheet = getLaporanKerjaSheet_();
    if (!sheet) return { success: false, message: 'Sheet DataLaporanKerja tidak tersedia.' };
    var now = new Date();
    var tglWib = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd');
    var jamWib = Utilities.formatDate(now, 'Asia/Jakarta', 'HH:mm:ss');
    var idLap = generateId_('LPR', sheet);
    var uid = (verified.id || verified.userId || '').toString().trim();
    var nama = (verified.nama || verified.email || 'Pengguna').toString().trim();
    var email = (verified.email || '').toString().trim().toLowerCase();
    var chName = (channelTerkait || '-').toString().trim() || '-';
    var ket = (keterangan || normCat).toString().trim().slice(0, 500);
    var src = (sumber === 'Otomatis' || sumber === 'Auto') ? 'Otomatis' : 'Manual';
    var ref = (refId || '').toString().trim();

    sheet.appendRow([
      idLap,
      tglWib,
      jamWib,
      uid,
      nama,
      email,
      normCat,
      chName,
      ket,
      src,
      ref,
      'Active'
    ]);
    SpreadsheetApp.flush();

    return { success: true, id: idLap, tanggalWib: tglWib, waktuWib: jamWib, kategori: normCat };
  } catch (err) {
    if (typeof Logger !== 'undefined' && Logger.log) Logger.log('recordWorkActivity error: ' + err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Deteksi Otomatis Progres Kerja Saat Edit Channel (Aset Manual, Video Hasil Edit, & Penjadwalan)
 */
function recordChannelEditAutoWork_(userSession, chId, chName, existingRow, newRow) {
  try {
    if (!existingRow || !newRow) return;
    var oldThumbs = parseAssetList(existingRow[16]);
    var newThumbs = parseAssetList(newRow[16]);
    var oldAudios = parseAssetList(existingRow[15]);
    var newAudios = parseAssetList(newRow[15]);
    var oldVideos = parseAssetList(existingRow[14]);
    var newVideos = parseAssetList(newRow[14]);

    var hasNewManualThumb = newThumbs.length > oldThumbs.length && newThumbs.slice(oldThumbs.length).some(function(it) { return !it.fileId; });
    var hasNewManualAudio = newAudios.length > oldAudios.length && newAudios.slice(oldAudios.length).some(function(it) { return !it.fileId; });
    if (hasNewManualThumb || hasNewManualAudio) {
      recordWorkActivity_(
        userSession,
        'Cari / Buat Bahan',
        chName,
        'Menambahkan tautan aset bahan (Thumbnail/Audio) pada channel ' + chName,
        'Otomatis',
        chId
      );
    }

    if (newVideos.length > oldVideos.length) {
      recordWorkActivity_(
        userSession,
        'Mengedit',
        chName,
        'Menambahkan video hasil edit / aset visual pada channel ' + chName,
        'Otomatis',
        chId
      );
    }

    var oldNext = (existingRow[12] || '').toString().trim();
    var newNext = (newRow[12] || '').toString().trim();
    var oldJam = (existingRow[11] || '').toString().trim();
    var newJam = (newRow[11] || '').toString().trim();
    if (newNext && (newNext !== oldNext || newJam !== oldJam)) {
      recordWorkActivity_(
        userSession,
        'Menjadwalkan',
        chName,
        'Mengatur jadwal tayang channel ke ' + newNext + ' pukul ' + (newJam || '14:00') + ' WIB',
        'Otomatis',
        chId
      );
    }
  } catch (e) {
    if (typeof Logger !== 'undefined' && Logger.log) Logger.log('recordChannelEditAutoWork error: ' + e.message);
  }
}

/**
 * Input Cepat Laporan Kerja Offline (Tanpa Input Jam Manual — Timestamp Dikunci Server WIB)
 */
function submitManualWorkLog(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid. Silakan login ulang.' };
    if (!canAccessModule(userSession, 'laporan') || !canPerformModuleAction(userSession, 'laporan', 'add')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin mencatat laporan kerja.' };
    }

    payload = payload || {};
    var kategori = normalizeWorkCategory_(payload.kategori || payload.category);
    if (!kategori) {
      return { success: false, message: 'Pilih salah satu kategori pekerjaan yang valid.' };
    }

    var keterangan = (payload.keterangan || payload.catatan || payload.detail || '').toString().trim();
    if (keterangan.length < 3) {
      return { success: false, message: 'Tuliskan catatan singkat pekerjaan minimal 3 karakter.' };
    }
    if (keterangan.length > 500) {
      keterangan = keterangan.slice(0, 500);
    }

    var channelTerkait = (payload.channelTerkait || payload.channel || '-').toString().trim() || '-';
    var recorded = recordWorkActivity_(userSession, kategori, channelTerkait, keterangan, 'Manual', '');
    if (!recorded || !recorded.success) {
      return { success: false, message: (recorded && recorded.message) || 'Gagal menyimpan catatan kerja.' };
    }

    logActivity_('Catat Laporan Kerja', recorded.id, '[' + kategori + '] ' + keterangan, userSession);
    return {
      success: true,
      id: recorded.id,
      kategori: kategori,
      tanggalWib: recorded.tanggalWib,
      waktuWib: recorded.waktuWib,
      message: 'Laporan "' + kategori + '" tercatat otomatis pada pukul ' + recorded.waktuWib + ' WIB!'
    };
  } catch (err) {
    return { success: false, message: 'Gagal mencatat laporan kerja: ' + err.message };
  }
}

function getUserWorkChannelOptions_(userSession, globalView) {
  var list = [];
  try {
    var sheet = getChannelSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return list;
    var uEmail = (userSession.email || '').toString().toLowerCase().trim();
    var uName = (userSession.nama || '').toString().toLowerCase().trim();
    var data = sheet.getRange(2, 1, lastRow - 1, 22).getDisplayValues();
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      if (!r[0] && !r[2]) continue;
      if ((r[21] || 'Active').toString().toLowerCase() === 'deleted') continue;
      if (!globalView) {
        var p = (r[6] || '').toString().toLowerCase().trim();
        if (p !== uEmail && p !== uName) continue;
      }
      if (r[2]) list.push(r[2].toString().trim());
    }
    list.sort();
  } catch (e) {}
  return list;
}

/**
 * Mesin Analitik Kinerja Harian Bersama (Dipakai UI Owner & Bot Rekap 23:00 WIB)
 */
function computeDailyWorkAnalytics_(targetDateYmd) {
  var dateStr = normalizeWorkDateYmd_(targetDateYmd);
  var userSheet = getUserSheet_();
  var uLast = userSheet.getLastRow();
  var staffUsers = [];
  var adminEmails = [];
  var staffBucketByKey = {};

  if (uLast > 1) {
    var uRows = userSheet.getRange(2, 1, uLast - 1, 19).getDisplayValues();
    for (var i = 0; i < uRows.length; i++) {
      var ur = uRows[i];
      var stHapus = (ur[18] || 'Active').toString().trim().toLowerCase();
      var stAkun = (ur[14] || '').toString().trim().toLowerCase();
      if (stHapus === 'deleted' || stAkun !== 'aktif') continue;

      var roleNorm = (ur[7] || '').toString().toUpperCase().replace(/[\s_]/g, '');
      var isAdmin = (roleNorm === 'SUPERADMIN' || roleNorm === 'OWNER' || roleNorm === 'SUPER' || roleNorm === 'ADMIN');
      var emailLower = (ur[5] || '').toString().trim().toLowerCase();
      var uid = (ur[0] || '').toString().trim();
      var nama = (ur[1] || emailLower || 'Pengguna').toString().trim();

      if (isAdmin) {
        if (emailLower && adminEmails.indexOf(emailLower) === -1) adminEmails.push(emailLower);
        continue;
      }

      var staffEntry = {
        userId: uid,
        nama: nama,
        email: emailLower,
        role: ur[7] || 'Pengguna',
        isSuperAdmin: false,
        totalAktivitas: 0,
        otomatisCount: 0,
        manualCount: 0,
        firstTime: '',
        lastTime: '',
        counts: createEmptyCategoryCounts_(),
        items: []
      };
      staffUsers.push(staffEntry);
      if (uid) staffBucketByKey['id:' + uid] = staffEntry;
      if (emailLower) staffBucketByKey['email:' + emailLower] = staffEntry;
      if (nama) staffBucketByKey['name:' + nama.toLowerCase()] = staffEntry;
    }
  }

  var lapSheet = getLaporanKerjaSheet_();
  var lLast = lapSheet.getLastRow();
  var allItems = [];
  var categoryTotals = createEmptyCategoryCounts_();
  var extraActorBuckets = {};

  if (lLast > 1) {
    var lRows = lapSheet.getRange(2, 1, lLast - 1, 12).getDisplayValues();
    for (var j = 0; j < lRows.length; j++) {
      var lr = lRows[j];
      if ((lr[COL_LAPORAN.STATUS_HAPUS] || 'Active').toString().trim().toLowerCase() === 'deleted') continue;
      if (normalizeWorkDateYmd_(lr[COL_LAPORAN.TANGGAL_WIB]) !== dateStr) continue;

      var cat = normalizeWorkCategory_(lr[COL_LAPORAN.KATEGORI]) || (lr[COL_LAPORAN.KATEGORI] || 'Lainnya');
      var wTime = (lr[COL_LAPORAN.WAKTU_WIB] || '').toString().trim();
      var uIdVal = (lr[COL_LAPORAN.USER_ID] || '').toString().trim();
      var uEmailVal = (lr[COL_LAPORAN.EMAIL_USER] || '').toString().trim().toLowerCase();
      var uNameVal = (lr[COL_LAPORAN.NAMA_USER] || uEmailVal || 'Pengguna').toString().trim();
      var srcVal = (lr[COL_LAPORAN.SUMBER] || 'Manual').toString().trim();

      var itemObj = {
        id: lr[COL_LAPORAN.ID],
        tanggalWib: dateStr,
        waktuWib: wTime,
        userId: uIdVal,
        namaUser: uNameVal,
        emailUser: uEmailVal,
        kategori: cat,
        channelTerkait: lr[COL_LAPORAN.CHANNEL] || '-',
        keterangan: lr[COL_LAPORAN.KETERANGAN] || '-',
        sumber: srcVal,
        refId: lr[COL_LAPORAN.REF_ID] || ''
      };
      allItems.push(itemObj);
      if (categoryTotals[cat] !== undefined) categoryTotals[cat]++;

      var bucket = (uIdVal && staffBucketByKey['id:' + uIdVal]) ||
        (uEmailVal && staffBucketByKey['email:' + uEmailVal]) ||
        (uNameVal && staffBucketByKey['name:' + uNameVal.toLowerCase()]);

      if (!bucket) {
        var extraKey = uEmailVal || uIdVal || uNameVal.toLowerCase();
        if (!extraActorBuckets[extraKey]) {
          extraActorBuckets[extraKey] = {
            userId: uIdVal,
            nama: uNameVal,
            email: uEmailVal,
            role: 'Admin / Lainnya',
            isSuperAdmin: true,
            totalAktivitas: 0,
            otomatisCount: 0,
            manualCount: 0,
            firstTime: '',
            lastTime: '',
            counts: createEmptyCategoryCounts_(),
            items: []
          };
        }
        bucket = extraActorBuckets[extraKey];
      }

      bucket.totalAktivitas++;
      if (srcVal.toLowerCase() === 'otomatis') bucket.otomatisCount++;
      else bucket.manualCount++;
      if (bucket.counts[cat] !== undefined) bucket.counts[cat]++;
      if (wTime && (!bucket.firstTime || wTime < bucket.firstTime)) bucket.firstTime = wTime;
      if (wTime && (!bucket.lastTime || wTime > bucket.lastTime)) bucket.lastTime = wTime;
      bucket.items.push(itemObj);
    }
  }

  var workedStaffCount = 0;
  var missingStaff = [];
  var staffSummaries = [];

  for (var sIdx = 0; sIdx < staffUsers.length; sIdx++) {
    var st = staffUsers[sIdx];
    st.items.sort(function(a, b) { return (b.waktuWib || '').localeCompare(a.waktuWib || ''); });
    staffSummaries.push(st);
    if (st.totalAktivitas > 0) {
      workedStaffCount++;
    } else {
      missingStaff.push({
        userId: st.userId,
        nama: st.nama,
        email: st.email,
        role: st.role
      });
    }
  }

  var extraKeys = Object.keys(extraActorBuckets);
  for (var ek = 0; ek < extraKeys.length; ek++) {
    var eb = extraActorBuckets[extraKeys[ek]];
    eb.items.sort(function(a, b) { return (b.waktuWib || '').localeCompare(a.waktuWib || ''); });
    staffSummaries.push(eb);
  }

  staffSummaries.sort(function(a, b) {
    if (b.totalAktivitas !== a.totalAktivitas) return b.totalAktivitas - a.totalAktivitas;
    return (a.nama || '').localeCompare(b.nama || '');
  });

  allItems.sort(function(a, b) { return (b.waktuWib || '').localeCompare(a.waktuWib || ''); });

  return {
    tanggal: dateStr,
    adminEmails: adminEmails,
    totalStafAktif: staffUsers.length,
    totalStafMelapor: workedStaffCount,
    totalStafBelumKerja: missingStaff.length,
    totalAktivitas: allItems.length,
    categoryTotals: categoryTotals,
    staffSummaries: staffSummaries,
    missingStaff: missingStaff,
    items: allItems
  };
}

function getWorkReportsData(params, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid. Silakan login ulang.' };
    if (!canAccessModule(userSession, 'laporan')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin membuka Laporan Kerja.' };
    }

    params = params || {};
    var targetDate = normalizeWorkDateYmd_(params.tanggal);
    var superUser = isSuperAdmin(userSession);
    var globalView = superUser || hasGlobalScope(userSession);
    var filterCat = normalizeWorkCategory_(params.kategori) || 'ALL';
    var filterStaff = (params.staffEmail || 'ALL').toString().trim().toLowerCase();

    var analytics = computeDailyWorkAnalytics_(targetDate);
    var channelOptions = getUserWorkChannelOptions_(userSession, globalView);

    if (!globalView) {
      var uEmail = (userSession.email || '').toLowerCase().trim();
      var uId = (userSession.id || userSession.userId || '').toString().trim();
      var myItems = [];
      var myCatTotals = createEmptyCategoryCounts_();
      var firstTime = '';
      var lastTime = '';

      for (var i = 0; i < analytics.items.length; i++) {
        var it = analytics.items[i];
        var isMine = (uId && it.userId === uId) || (uEmail && it.emailUser === uEmail);
        if (!isMine) continue;
        if (myCatTotals[it.kategori] !== undefined) myCatTotals[it.kategori]++;
        if (it.waktuWib && (!firstTime || it.waktuWib < firstTime)) firstTime = it.waktuWib;
        if (it.waktuWib && (!lastTime || it.waktuWib > lastTime)) lastTime = it.waktuWib;
        if (filterCat !== 'ALL' && it.kategori !== filterCat) continue;
        myItems.push(it);
      }

      return {
        success: true,
        mode: 'staff',
        tanggal: analytics.tanggal,
        summary: {
          totalAktivitas: myItems.length,
          firstTime: firstTime,
          lastTime: lastTime
        },
        categoryTotals: myCatTotals,
        items: myItems,
        channelOptions: channelOptions
      };
    }

    var filteredItems = analytics.items.filter(function(it) {
      if (filterCat !== 'ALL' && it.kategori !== filterCat) return false;
      if (filterStaff !== 'all' && filterStaff !== '' && it.emailUser !== filterStaff && it.namaUser.toLowerCase() !== filterStaff) return false;
      return true;
    });

    var recapMeta = getDailyRecapMetaForOwner_(superUser);

    return {
      success: true,
      mode: 'owner',
      isSuperAdmin: superUser,
      tanggal: analytics.tanggal,
      kpis: {
        totalStafAktif: analytics.totalStafAktif,
        totalStafMelapor: analytics.totalStafMelapor,
        totalStafBelumKerja: analytics.totalStafBelumKerja,
        totalAktivitas: analytics.totalAktivitas
      },
      categoryTotals: analytics.categoryTotals,
      staffSummaries: analytics.staffSummaries,
      missingStaff: analytics.missingStaff,
      items: filteredItems,
      channelOptions: channelOptions,
      recapStatus: recapMeta
    };
  } catch (err) {
    return { success: false, message: 'Gagal memuat laporan kerja: ' + err.message };
  }
}

function deleteWorkLogItem(idLaporan, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession) return { success: false, authExpired: true, message: 'Sesi tidak valid.' };
    if (!canPerformModuleAction(userSession, 'laporan', 'delete')) {
      return { success: false, message: 'Akses ditolak: Anda tidak memiliki izin menghapus catatan laporan kerja.' };
    }

    var sheet = getLaporanKerjaSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, message: 'Data laporan kosong.' };

    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    for (var i = 0; i < ids.length; i++) {
      if ((ids[i][0] || '').toString().trim() === (idLaporan || '').toString().trim()) {
        sheet.getRange(i + 2, COL_LAPORAN.STATUS_HAPUS + 1).setValue('Deleted');
        SpreadsheetApp.flush();
        logActivity_('Hapus Laporan Kerja', idLaporan, 'Menghapus catatan laporan kerja', userSession);
        return { success: true, message: 'Catatan laporan ' + idLaporan + ' berhasil dihapus.' };
      }
    }
    return { success: false, message: 'ID laporan tidak ditemukan.' };
  } catch (err) {
    return { success: false, message: 'Gagal menghapus laporan: ' + err.message };
  }
}

function getOwnerRecapRecipients_(analytics) {
  var list = [];
  if (analytics && Array.isArray(analytics.adminEmails)) {
    for (var i = 0; i < analytics.adminEmails.length; i++) {
      var em = (analytics.adminEmails[i] || '').toString().trim().toLowerCase();
      if (em && em.indexOf('@') > -1 && list.indexOf(em) === -1) list.push(em);
    }
  }
  try {
    var extra = PropertiesService.getScriptProperties().getProperty('DAILY_RECAP_EXTRA_EMAILS') || '';
    var parts = extra.split(/[,;\s]+/);
    for (var j = 0; j < parts.length; j++) {
      var p = (parts[j] || '').toString().trim().toLowerCase();
      if (p && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p) && list.indexOf(p) === -1) {
        list.push(p);
      }
    }
  } catch (e) {}
  return list;
}

function buildDailyRecapEmailHtml_(analytics, nowStampWib) {
  var h = '<div style="font-family:Inter,Arial,sans-serif;background:#07120b;color:#f1f5f9;padding:24px;border-radius:14px;max-width:720px;border:1px solid #065f46;">';
  h += '<h2 style="color:#34d399;margin:0 0 6px 0;">Rekap Laporan Kerja Tim Harian — DoGo Studio V1</h2>';
  h += '<p style="margin:0 0 18px 0;font-size:13px;color:#94a3b8;">Tanggal Kerja: <strong style="color:#fff;">' + escapeEmailHtml_(analytics.tanggal) + '</strong> | Dikumpulkan Otomatis: <strong>' + escapeEmailHtml_(nowStampWib) + ' WIB</strong></p>';

  h += '<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;background:#0a1710;border:1px solid #064e3b;">';
  h += '<tr>';
  h += '<td align="center" style="border-right:1px solid #064e3b;"><div style="font-size:11px;color:#94a3b8;">Staf Aktif</div><div style="font-size:20px;font-weight:bold;color:#fff;">' + analytics.totalStafAktif + '</div></td>';
  h += '<td align="center" style="border-right:1px solid #064e3b;"><div style="font-size:11px;color:#94a3b8;">Sudah Bekerja</div><div style="font-size:20px;font-weight:bold;color:#34d399;">' + analytics.totalStafMelapor + '</div></td>';
  h += '<td align="center" style="border-right:1px solid #064e3b;"><div style="font-size:11px;color:#94a3b8;">Belum Ada Aktivitas</div><div style="font-size:20px;font-weight:bold;color:#fb7185;">' + analytics.totalStafBelumKerja + '</div></td>';
  h += '<td align="center"><div style="font-size:11px;color:#94a3b8;">Total Tugas Tercatat</div><div style="font-size:20px;font-weight:bold;color:#fbbf24;">' + analytics.totalAktivitas + '</div></td>';
  h += '</tr></table>';

  if (analytics.missingStaff && analytics.missingStaff.length > 0) {
    h += '<div style="padding:12px 14px;background:#3f0d16;border:1px solid #be123c;border-radius:8px;margin-bottom:18px;">';
    h += '<strong style="color:#fda4af;font-size:13px;">Perhatian — Staf Tanpa Catatan Kerja Hari Ini (' + analytics.missingStaff.length + ' Orang):</strong><ul style="margin:6px 0 0 18px;padding:0;font-size:12px;color:#fecdd3;">';
    for (var m = 0; m < analytics.missingStaff.length; m++) {
      var ms = analytics.missingStaff[m];
      h += '<li>' + escapeEmailHtml_(ms.nama) + ' (' + escapeEmailHtml_(ms.email) + ')</li>';
    }
    h += '</ul></div>';
  }

  h += '<h3 style="color:#fff;font-size:14px;margin:0 0 8px 0;">Ringkasan Progres & Waktu Kerja Per Staf</h3>';
  h += '<table width="100%" cellpadding="7" cellspacing="0" style="border-collapse:collapse;font-size:12px;background:#0a1710;border:1px solid #064e3b;margin-bottom:18px;">';
  h += '<thead><tr style="background:#064e3b;color:#a7f3d0;">';
  h += '<th align="left">Nama Staf</th><th align="center">Jam Aktif (WIB)</th><th align="center">Email</th><th align="center">Channel</th><th align="center">Bahan</th><th align="center">Edit</th><th align="center">Upload</th><th align="center">Jadwal</th><th align="center">Total</th>';
  h += '</tr></thead><tbody>';

  for (var s = 0; s < analytics.staffSummaries.length; s++) {
    var st = analytics.staffSummaries[s];
    var timeRange = st.totalAktivitas > 0 ? ((st.firstTime ? st.firstTime.slice(0, 5) : '-') + ' s/d ' + (st.lastTime ? st.lastTime.slice(0, 5) : '-')) : 'Tidak ada';
    h += '<tr style="border-top:1px solid #064e3b;">';
    h += '<td><strong style="color:#fff;">' + escapeEmailHtml_(st.nama) + '</strong>' + (st.isSuperAdmin ? ' <span style="color:#fbbf24;font-size:10px;">(Admin)</span>' : '') + '</td>';
    h += '<td align="center" style="color:#94a3b8;">' + escapeEmailHtml_(timeRange) + '</td>';
    h += '<td align="center">' + (st.counts['Buat Email'] || 0) + '</td>';
    h += '<td align="center">' + (st.counts['Buat Channel'] || 0) + '</td>';
    h += '<td align="center">' + (st.counts['Cari / Buat Bahan'] || 0) + '</td>';
    h += '<td align="center">' + (st.counts['Mengedit'] || 0) + '</td>';
    h += '<td align="center">' + (st.counts['Upload'] || 0) + '</td>';
    h += '<td align="center">' + (st.counts['Menjadwalkan'] || 0) + '</td>';
    h += '<td align="center"><strong style="color:' + (st.totalAktivitas > 0 ? '#34d399' : '#fb7185') + ';">' + st.totalAktivitas + '</strong></td>';
    h += '</tr>';
  }
  h += '</tbody></table>';

  if (analytics.items && analytics.items.length > 0) {
    h += '<h3 style="color:#fff;font-size:14px;margin:0 0 8px 0;">Kronologi Detail Aktivitas Hari Ini</h3>';
    h += '<ul style="margin:0;padding-left:18px;font-size:12px;color:#cbd5e1;line-height:1.6;">';
    var maxLines = Math.min(analytics.items.length, 60);
    for (var k = 0; k < maxLines; k++) {
      var it = analytics.items[k];
      h += '<li><code style="color:#38bdf8;">[' + escapeEmailHtml_((it.waktuWib || '').slice(0, 8)) + ' WIB]</code> <strong>' + escapeEmailHtml_(it.namaUser) + '</strong> — <em>' + escapeEmailHtml_(it.kategori) + '</em>' + (it.channelTerkait && it.channelTerkait !== '-' ? ' (' + escapeEmailHtml_(it.channelTerkait) + ')' : '') + ': ' + escapeEmailHtml_(it.keterangan) + ' <span style="color:#94a3b8;font-size:11px;">[' + escapeEmailHtml_(it.sumber) + ']</span></li>';
    }
    if (analytics.items.length > maxLines) {
      h += '<li style="color:#94a3b8;">...dan ' + (analytics.items.length - maxLines) + ' catatan lainnya (buka menu Laporan Kerja di aplikasi untuk daftar lengkap).</li>';
    }
    h += '</ul>';
  }

  h += '<p style="font-size:11px;color:#64748b;margin-top:20px;border-top:1px solid #064e3b;padding-top:10px;">Dikirim otomatis oleh Sistem Rekap Harian 23:00 WIB DoGo Studio V1.</p>';
  h += '</div>';
  return h;
}

/**
 * Mesin Pengumpul & Pengirim Rekap Harian ke Owner (Idempoten per Tanggal)
 */
function compileAndSendDailyWorkRecap_(targetDateYmd, forceResend) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var dateStr = normalizeWorkDateYmd_(targetDateYmd);
    var rekapSheet = getRekapHarianSheet_();
    var rLast = rekapSheet.getLastRow();
    var existingRowIdx = -1;
    var existingEmailStatus = '';

    if (rLast > 1) {
      var rRows = rekapSheet.getRange(2, 1, rLast - 1, 8).getDisplayValues();
      for (var i = 0; i < rRows.length; i++) {
        if ((rRows[i][COL_REKAP.TANGGAL] || '').toString().trim() === dateStr) {
          existingRowIdx = i + 2;
          existingEmailStatus = (rRows[i][COL_REKAP.STATUS_EMAIL] || '').toString().trim();
          break;
        }
      }
    }

    if (existingRowIdx !== -1 && !forceResend && existingEmailStatus.indexOf('Terkirim') === 0) {
      return { success: true, alreadySent: true, tanggal: dateStr, statusEmail: existingEmailStatus, message: 'Rekap tanggal ' + dateStr + ' sudah dikumpulkan sebelumnya.' };
    }

    var analytics = computeDailyWorkAnalytics_(dateStr);
    var nowStamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
    var recipients = getOwnerRecapRecipients_(analytics);
    var statusEmail = 'Tersimpan In-App (Email Owner belum dikonfigurasi)';
    var emailSent = false;

    if (recipients.length > 0) {
      var recipientsCsv = recipients.join(', ');
      var htmlBody = buildDailyRecapEmailHtml_(analytics, nowStamp);
      try {
        MailApp.sendEmail({
          to: recipientsCsv,
          subject: '[DoGo Studio V1] Rekap Kerja Tim Harian (' + dateStr + ') - ' + analytics.totalAktivitas + ' Tugas',
          htmlBody: htmlBody
        });
        statusEmail = 'Terkirim ke ' + recipientsCsv + ' (' + nowStamp + ' WIB)';
        emailSent = true;
      } catch (mailErr) {
        statusEmail = 'Tersimpan In-App | Email gagal: ' + mailErr.message;
      }
    }

    var summarySnapshot = {
      categoryTotals: analytics.categoryTotals,
      missingStaff: analytics.missingStaff,
      staffSummaries: analytics.staffSummaries.map(function(st) {
        return {
          nama: st.nama,
          email: st.email,
          totalAktivitas: st.totalAktivitas,
          firstTime: st.firstTime,
          lastTime: st.lastTime,
          counts: st.counts
        };
      })
    };

    var idRekap = existingRowIdx !== -1
      ? rekapSheet.getRange(existingRowIdx, 1).getDisplayValue()
      : generateId_('RKP', rekapSheet);

    var rowVals = [
      idRekap,
      dateStr,
      nowStamp,
      analytics.totalStafAktif,
      analytics.totalStafMelapor,
      analytics.totalAktivitas,
      JSON.stringify(summarySnapshot),
      statusEmail
    ];

    if (existingRowIdx !== -1) {
      rekapSheet.getRange(existingRowIdx, 1, 1, rowVals.length).setValues([rowVals]);
    } else {
      rekapSheet.appendRow(rowVals);
    }
    SpreadsheetApp.flush();

    return {
      success: true,
      emailSent: emailSent,
      tanggal: dateStr,
      waktuKumpul: nowStamp,
      statusEmail: statusEmail,
      totalAktivitas: analytics.totalAktivitas,
      totalStafMelapor: analytics.totalStafMelapor,
      totalStafAktif: analytics.totalStafAktif,
      message: emailSent
        ? ('Rekap harian berhasil dikumpulkan dan dikirim ke ' + recipients.join(', ') + '!')
        : ('Rekap tersimpan ke arsip sistem (' + statusEmail + ')')
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handler Trigger Otomatis Pukul 23:00 WIB Setiap Hari
 */
function runDailyWorkRecapJob() {
  var res = compileAndSendDailyWorkRecap_(getTodayDateYmdWIB(0), false);
  return {
    success: !!(res && res.success),
    emailSent: !!(res && res.emailSent),
    alreadySent: !!(res && res.alreadySent),
    tanggal: res ? res.tanggal : getTodayDateYmdWIB(0)
  };
}

function hasDailyRecapTriggerSafe_() {
  try {
    if (typeof ScriptApp === 'undefined' || !ScriptApp.getProjectTriggers) return false;
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction && triggers[i].getHandlerFunction() === 'runDailyWorkRecapJob') {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function getDailyRecapMetaForOwner_(includeEditableConfig) {
  var triggerActive = hasDailyRecapTriggerSafe_();
  var extraEmails = '';
  try {
    extraEmails = PropertiesService.getScriptProperties().getProperty('DAILY_RECAP_EXTRA_EMAILS') || '';
  } catch (e) {}

  var archives = [];
  try {
    var sheet = getRekapHarianSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, 8).getDisplayValues();
      for (var i = rows.length - 1; i >= 0; i--) {
        var r = rows[i];
        if (!r[0] && !r[1]) continue;
        archives.push({
          id: r[COL_REKAP.ID],
          tanggal: r[COL_REKAP.TANGGAL],
          waktuKumpul: r[COL_REKAP.WAKTU_KUMPUL],
          totalStafAktif: parseInt(r[COL_REKAP.TOTAL_STAF_AKTIF], 10) || 0,
          totalStafMelapor: parseInt(r[COL_REKAP.TOTAL_STAF_MELAPOR], 10) || 0,
          totalAktivitas: parseInt(r[COL_REKAP.TOTAL_AKTIVITAS], 10) || 0,
          statusEmail: r[COL_REKAP.STATUS_EMAIL] || '-'
        });
        if (archives.length >= 14) break;
      }
    }
  } catch (e) {}

  return {
    triggerActive: triggerActive,
    extraOwnerEmails: includeEditableConfig ? extraEmails : '',
    archives: archives
  };
}

function installDailyRecapTriggerInternal_() {
  if (typeof ScriptApp === 'undefined' || !ScriptApp.getProjectTriggers || !ScriptApp.newTrigger) {
    return { success: false, message: 'Layanan ScriptApp tidak tersedia di lingkungan ini.' };
  }
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction && existing[i].getHandlerFunction() === 'runDailyWorkRecapJob') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  try {
    ScriptApp.newTrigger('runDailyWorkRecapJob')
      .timeBased()
      .everyDays(1)
      .atHour(23)
      .nearMinute(0)
      .inTimezone('Asia/Jakarta')
      .create();
  } catch (e) {
    ScriptApp.newTrigger('runDailyWorkRecapJob')
      .timeBased()
      .everyDays(1)
      .atHour(23)
      .inTimezone('Asia/Jakarta')
      .create();
  }
  return {
    success: true,
    triggerActive: true,
    message: 'Jadwal otomatis pengumpulan laporan jam 23:00 WIB setiap hari berhasil diaktifkan!'
  };
}

function setupDailyWorkRecapTrigger(userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !isSuperAdmin(userSession)) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Hanya Owner / Super Admin yang dapat mengatur jadwal otomatis.' };
    }
    var res = installDailyRecapTriggerInternal_();
    if (res.success) {
      logActivity_('Aktifkan Trigger Rekap 23:00', 'runDailyWorkRecapJob', 'Bot rekap harian 23:00 WIB diaktifkan', userSession);
    }
    return res;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal memasang trigger via web (' + err.message + '). Silakan jalankan fungsi initDailyReportTrigger() satu kali di editor Google Apps Script untuk memberi izin jadwal.'
    };
  }
}

/**
 * Fallback 1-Klik di Editor Apps Script jika memerlukan izin OAuth pertama kali
 */
function initDailyReportTrigger() {
  var res = installDailyRecapTriggerInternal_();
  return {
    success: !!(res && res.success),
    triggerActive: !!(res && res.triggerActive),
    message: (res && res.message) || ''
  };
}

function saveOwnerRecapConfig(payload, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !isSuperAdmin(userSession)) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Hanya Owner / Super Admin yang dapat mengubah penerima laporan.' };
    }
    payload = payload || {};
    var raw = (payload.extraOwnerEmails || '').toString().trim();
    var validList = [];
    if (raw) {
      var parts = raw.split(/[,;\s]+/);
      for (var i = 0; i < parts.length; i++) {
        var em = parts[i].trim().toLowerCase();
        if (!em) continue;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          return { success: false, message: 'Format email tidak valid: ' + em };
        }
        if (validList.indexOf(em) === -1) validList.push(em);
      }
    }
    PropertiesService.getScriptProperties().setProperty('DAILY_RECAP_EXTRA_EMAILS', validList.join(', '));
    logActivity_('Update Email Penerima Rekap', 'DAILY_RECAP_EXTRA_EMAILS', validList.join(', ') || '(kosong)', userSession);
    return {
      success: true,
      extraOwnerEmails: validList.join(', '),
      message: 'Email penerima laporan tambahan berhasil disimpan!'
    };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan pengaturan penerima: ' + err.message };
  }
}

function triggerManualDailyRecapNow(targetDate, userSession) {
  try {
    userSession = authenticateSession(userSession);
    if (!userSession || !isSuperAdmin(userSession)) {
      return { success: false, authExpired: !userSession, message: 'Akses ditolak: Hanya Owner / Super Admin yang dapat menarik & mengirim rekap manual.' };
    }
    var dateStr = normalizeWorkDateYmd_(targetDate);
    var res = compileAndSendDailyWorkRecap_(dateStr, true);
    logActivity_('Rekap Kerja Manual', dateStr, res.statusEmail || 'Dijalankan manual', userSession);
    return res;
  } catch (err) {
    return { success: false, message: 'Gagal menjalankan rekap manual: ' + err.message };
  }
}


