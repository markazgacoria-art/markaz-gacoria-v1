# DOKUMEN SPESIFIKASI PRODUK (PRD) & MASTER CONTEXT RESMI
================================================================================
NAMA SISTEM : DOGO STUDIO V1 (v1.0 - PRODUCTION EDITION)
ENGINE      : ZettBOT Core v4.1 by Zettbos
STATUS PRD  : MASTER BLUEPRINT FINAL & SINGLE SOURCE OF TRUTH (LIVING CONTEXT)
================================================================================

================================================================================
ZONA 1: SPESIFIKASI KEBUTUHAN PRODUK (MASTER BLUEPRINT RESMI)
================================================================================

## 1. NAMA PROJEK & PROBLEM STATEMENT
- **Nama Sistem:** DoGo Studio V1.
- **Problem Statement:**
  Operasional studio YouTube skala besar (100+ channel) membutuhkan sistem operasi terpadu yang mampu menyelesaikan kendala:
  1. Pengelolaan ratusan channel YouTube secara mandiri tanpa saling tumpang tindih antar operator.
  2. Pemantauan jadwal harian dengan jam publish paten tanpa membuang waktu mengetik ulang jam publish berulang kali.
  3. Pemisahan ketat antara data sensitif pemilik (Database AdSense & Keuangan) dengan data operasional pengguna.
  4. Penyimpanan aset produksi (Visual, Audio, Thumbnail), bukti nota, foto fisik barang belanja, dan dokumen identitas KYC KTP secara otomatis dan rapi di Google Drive.
  5. Pengendalian hak akses granular dari Admin Panel (mengatur siapa yang boleh mengakses modul apa, materi mana, dan tool apa saja).
  6. Antarmuka modern *Dark Emerald Luxury* yang sangat responsif di layar ponsel pintar (360px) maupun monitor komputer PC lebar.

---

## 2. PERAN PENGGUNA (ROLE MATRIX DUA TINGKAT RESMI)
Sistem menerapkan struktur peran datar (*flat two-tier model*) tanpa kasta tim yang membingungkan:
1. **Admin (Super Admin / Studio Owner):**
   - Memegang kendali mutlak di **Admin Panel**.
   - Berhak menyetujui (*Approve*) pendaftaran akun baru dan membuka blokir akun yang dibekukan akibat 5x salah password.
   - Satu-satunya pihak yang berhak mengakses dan mengelola **Database AdSense**.
   - Mengatur sakelar izin per pengguna: izin modul (termasuk membuka akses Keuangan bagi staf finance), izin aksi (Tambah/Edit/Hapus), serta daftar checklist materi dan tools mana saja yang boleh diakses.
   - Mengakses menu **Tong Sampah (*Trash Bin*)** untuk me-*restore* data atau menghapusnya secara permanen (*Hard Delete*).
2. **Pengguna (Operator / Creator / Editor):**
   - Hanya melihat, menginput, dan mengelola **datanya sendiri** (data kepemilikan pribadi).
   - Mengakses modul, materi edukasi, dan tools yang secara eksplisit diizinkan oleh Admin di Admin Panel.
   - Wajib melengkapi identitas profil KYC (Nama KTP, NIK, No WhatsApp, Alamat, Foto KTP, dan Nomor Rekening Bank).

---

## 3. ARSITEKTUR & LINGKUNGAN KERJA
- **Platform:** Google Apps Script (GAS) Web App + Google Sheets Database Cloud.
- **Frontend:** HTML5, Tailwind CSS, FontAwesome 6 Pro, Inter & SF Pro Typography.
- **Backend:** Google Apps Script Modular (`code.gs`, `setup.gs`) dengan Google Sheets API & Google Drive API.
- **Penyimpanan Berkas:** Google Drive API resmi dengan otomatisasi folder dan penggantian nama berkas (*auto-rename*).
- **Desain Arsitektur:** Modular Web App (`index.html`, `css.html`, `modals.html`, `js.html`) dengan *In-Memory Caching* di browser klien untuk perpindahan menu secepat kilat (0 detik).
- **Tema Visual:** *Luxury Organic Dark Emerald* (`#060d09` & `#07120b`) dengan aksen neon emerald (`#00e676`), border kaca halus, dan ikon SVG tajam anti-emoji norak.

---

## 4. ALUR KERJA APLIKASI (USER FLOW DARI AWAL HINGGA AKHIR)

### MODUL 1: AUTENTIKASI PENGGUNA & PROTOKOL KEAMANAN
1. **Pendaftaran Akun Baru (Approval Gate):**
   - Pengguna mendaftar: Nama Lengkap, Email, Password (minimal 6 karakter), dan Konfirmasi Password.
   - Status awal akun: `Pending Approval`. Pengguna **TIDAK BISA LOGIN** sampai akunnya disetujui (*Approved*) oleh Admin di Admin Panel.
2. **Anti-Brute Force (Maksimal 5x Salah Password):**
   - Jika pengguna salah memasukkan password sebanyak **5 kali berturut-turut**, akun otomatis **DIBEKUKAN (*FROZEN/LOCKED*)**.
   - Pengguna harus menghubungi Admin, dan hanya Admin melalui tombol `[ Buka Blokir ]` di Admin Panel yang dapat memulihkan akun tersebut.
3. **Lupa Password Mandiri:**
   - Pengguna dapat mereset password secara mandiri via form reset di layar login, selama belum melanggar batas 5 kali kegagalan.

### MODUL 2: DASHBOARD EKSEKUTIF (MURNI METRIK & LEADERBOARDS)
*Dashboard murni sebagai ringkasan eksekutif performa studio. Target upload dikeluarkan total dari halaman ini.*
1. **Header Dashboard:** Sapaan dinamis ("Halo, [Nama Pengguna]"), jam real-time, dan tombol update data real-time.
2. **6 Kartu KPI Terpadu (Responsive Grid 2 kolom HP / 6 kolom PC):**
   - 1) Total Channel
   - 2) Channel Aktif (🟢)
   - 3) Channel Tidak Aktif (🔴)
   - 4) Sudah Monetize (⭐)
   - 5) Belum Monetize (⚪)
   - 6) Total Pendapatan Bulan Berjalan (Rp)
3. **2 Papan Peringkat (Leaderboards) Bersebelahan di PC / Tab di HP:**
   - **Top 10 Belum Monet:** Dihitung dari akumulasi skor $\text{Skor} = (\text{Subscribers} \times 1) + (\text{Jam Tayang} \times 2)$. Menampilkan Rank 1–10.
   - **Top 10 Sudah Monet:** Dihitung murni dari **Estimasi Pendapatan Bulan Berjalan Terbesar** (Rank 1–10).
4. **Logika Privasi:** Jika Pengguna biasa yang login, angka KPI dan leaderboard hanya menghitung channel miliknya. Jika Admin yang login, menghitung seluruh channel studio.

### MODUL 3: JADWAL PENGERJAAN & TUGAS HARI INI
*Pusat operasional dan eksekusi tugas harian studio.*
1. **Kotak Peringatan Overdue (Terlewat):** Terletak di posisi paling atas jika ada channel yang tanggal targetnya kemarin atau lebih lama dan belum diselesaikan (dilengkapi badge merah).
2. **Kalender 1 Bulan Interaktif:**
   - Tampilan visual 30/31 hari (Senin s/d Minggu).
   - Kotak tanggal hari ini menyala border neon emerald.
   - Tanggal yang memiliki jadwal diberi titik indikator. Kotak tanggal dapat diklik untuk memfilter tugas pada tanggal tersebut.
3. **Target Upload Hari Ini:**
   - Menampilkan kartu channel yang jatuh tempo pengerjaannya hari ini.
   - Menampilkan patokan **Jam Publish Tetap** (misal: 14:00 WIB).
   - Jam publish ini **TIDAK PERLU DIKETIK ULANG** setiap kali menyelesaikan tugas! Nilai jam publish tetap permanen kecuali sengaja diubah di edit channel.
4. **Alur Cerdas Tombol [ ✅ Selesai Pengerjaan ]:**
   - Pengguna mengklik tombol selesai pada channel hari ini:
     * **Jika Channel BELUM MONET:** Popup meminta input: **Subscribers Terbaru**, **Jam Tonton Terbaru**, dan **Tanggal Pengerjaan Berikutnya** (date picker bebas tanpa tombol cepat +1/+2).
     * **Jika Channel SUDAH MONET:** Popup meminta input: **Estimasi Pendapatan Bulan Ini Terbaru (Rp)** dan **Tanggal Pengerjaan Berikutnya**.
   - **Logika Update Pendapatan (Bukan Dijumlah, Tapi Diganti/Snapshot):**
     * Di bulan yang sama (misal November): angka pendapatan baru **MENGGANTI** angka bulan berjalan (tgl 15 input 5jt, tgl 20 input 7jt -> total November menjadi 7jt, bukan 12jt).
     * Saat berganti bulan: angka final bulan sebelumnya otomatis tersimpan permanen ke **Riwayat Pendapatan Bulanan Channel**.
   - Setelah disimpan, channel otomatis hilang dari antrean hari ini dan berpindah ke tanggal berikutnya di kalender.

### MODUL 4: DATABASE CHANNEL
1. **10 Kolom Baku Mandiri di Tabel Utama (Anti-Gabung):**
   - 1) **Logo / Foto Riil Channel:** Opsi upload file logo channel atau link gambar resmi YouTube (tanpa avatar generik).
   - 2) **Nama Channel & Link:** Nama channel + link aktif warna hijau yang bisa langsung diklik buka YouTube.
   - 3) **Subscribers:** Jumlah subscriber terbaru.
   - 4) **Jam Tonton:** Akumulasi jam tayang.
   - 5) **Pengelola / Pemilik:** Otomatis mencatat nama pengguna yang sedang login saat menginput channel.
   - 6) **Kategori:** Dropdown tersendiri (Long-Form, Shorts, Hiburan, Edukasi, Vlogging, dll).
   - 7) **Niche:** Dropdown tersendiri terpisah dari Kategori (Ternak, Gaming, Keuangan, dll).
   - 8) **Status Channel:** 🟢 `Aktif` / 🔴 `Tidak Aktif`.
   - 9) **Monetisasi:** ⭐ `YES: Monet` / ⚪ `NO: Belum Monet`.
   - 10) **Aksi Terpisah:**
     * 📁 **Tombol Aset Drive:** Membuka laci aset (Visual, Audio, Thumbnail) + Kolom Teks Judul & Deskripsi.
     * 👁️ **Tombol Detail:** Informasi akun lengkap & tabel Riwayat Pendapatan Bulanan.
     * ✏️ **Tombol Edit:** Form edit data channel & jam publish paten.
     * 🗑️ **Tombol Hapus:** Soft delete ke Tong Sampah (hanya Admin).
2. **Otomatisasi Google Drive Channel:**
   - Struktur folder otomatis di Drive: `Database Channel / [Nama Channel] /`
   - Berisi aset: **Visual (Video)**, **Audio (Voice/Backsound)**, dan **Thumbnail Lightbox** (1-klik preview & download).
3. **Kolom Teks Judul & Deskripsi YouTube:**
   - Kolom teks khusus untuk Judul dan Deskripsi video YouTube lengkap dengan tombol **1-Klik Salin ke Clipboard** (`[📋 Salin Judul]` & `[📋 Salin Deskripsi]`).
4. **Relasi ke Database Email:**
   - Saat input channel, pengguna memilih akun email dari Database Email (1 Email bisa memiliki banyak Channel).
5. **Paginasi Fleksibel:** Pilihan baris 10, 20, 50, atau 100 channel per halaman.

### MODUL 5: DATABASE EMAIL
1. **Kolom Tabel Utama:**
   - 1) Alamat Email
   - 2) Password (default disembunyikan `••••••••` + tombol mata `[👁️]` untuk intip password)
   - 3) Kunci Autentikator 2FA / OTP
   - 4) Nomor Pemulihan
   - 5) Email Pemulihan
   - 6) Kode Cadangan (Backup Codes)
   - 7) **Pemilik / Pengelola:** Nama user penanggung jawab email.
   - 8) **Channel Terhubung:** Badge interaktif `[ 3 Channel ▾ ]`. Saat diklik, muncul modal popup daftar nama channel yang terhubung ke email ini (`Channel A`, `Channel B`, `Channel C`).
   - 9) Aksi: Detail, Edit, Hapus (Soft Delete ke Tong Sampah).
2. **Sistem Kode Cadangan Cerdas (Anti-Berantakan):**
   - Pengguna bebas copy-paste teks mentah dari Google apa adanya.
   - Sistem otomatis merapikannya dengan koma (`12345678, 87654321, ...`) sehingga tersimpan rapi dalam satu sel spreadsheet tanpa merusak baris.
   - Di aplikasi, kode muncul sebagai tombol chip kecil yang bisa disalin (*1-click copy*) per kode.

### MODUL 6: DATABASE ADSENSE (KHUSUS ADMIN PANEL)
*Terpisah mutlak dari Keuangan. Hanya bisa diakses dan dikelola oleh Admin Panel.*
1. **Kolom Tabel Utama:**
   - 1) ID AdSense Google (Manual copy-paste apa adanya dari Google: `pub-xxxxxxxxxxxxxx`).
   - 2) Email Akun AdSense & Password (dengan tombol intip mata).
   - 3) Autentikator 2FA & Pemulihan (Kunci 2FA, Email Pemulihan, No Pemulihan).
   - 4) Nama Sesuai KTP.
   - 5) Bank & Nomor Rekening (Nama Bank, No Rekening, dan Nama Terdaftar di Rekening).
   - 6) Status PIN: 🟢 `Sudah PIN` / 🟡 `Belum PIN`.
   - 7) Status Verifikasi: 🟢 `Terverifikasi` / 🟡 `Pending`.
   - 8) Foto KTP: Tombol `[👁️ Pratinjau KTP]` dan `[⬇️ Unduh]`.
   - 9) Aksi: Detail, Edit, Hapus (Soft Delete ke Tong Sampah).
2. **Otomatisasi Google Drive Khusus AdSense:**
   - Folder Drive otomatis: `Database AdSense / [Nama Sesuai KTP] /`
   - Berkas di dalamnya otomatis di-rename menjadi: `KTP_[Nama_Sesuai_KTP].jpg`.

### MODUL 7: DATABASE PENGGUNA & ADMIN CONTROL CENTER (MASTER ANGGOTA)
*Pusat manajemen anggota studio, verifikasi KYC, dan pengaturan izin hak akses.*
1. **Data Identitas Pengguna yang Direkam:**
   - Nama Lengkap Sesuai KTP
   - NIK (16 digit nomor KTP)
   - Nomor WhatsApp Aktif (dilengkapi tombol `[💬 Chat WA]` langsung)
   - Alamat Tempat Tinggal / Domisili Lengkap
   - Foto Profil Pengguna
   - Foto KTP Asli
   - Data Rekening Bank (Nama Bank, No Rekening, Atas Nama Rekening)
   - Tanggal Bergabung & Total Channel yang Dipegang
   - Status Akun: 🟡 `Pending Approval` / 🟢 `Aktif` / 🔴 `Dibekukan`
2. **Otomatisasi Google Drive Pengguna:**
   - Folder Drive otomatis: `Database Pengguna / [Nama Pengguna] /`
   - Berkas KTP otomatis di-rename menjadi: `KTP_[Nama_Pengguna].jpg`.
3. **Pusat Kendali Hak Akses Granular di Admin Panel (`[ ⚙️ Atur Izin Akses ]`):**
   - **Sakelar Menu Utama:** Nyalakan/matikan akses ke Channel, Email, Keuangan, Materi, Tools, Jadwal per pengguna.
   - **Checklist Akses Materi Spesifik:** Pilihan `[Semua Materi]` ATAU centang materi video tutorial tertentu saja yang boleh ditonton.
   - **Checklist Akses Tools Spesifik:** Pilihan `[Semua Tools]` ATAU centang tools tertentu saja yang boleh dipakai.
   - **Izin Tindakan:** Sakelar izin Tambah, Edit, atau Hapus per pengguna.
   - **Tombol Pulihkan Akun:** Membuka blokir pengguna yang dibekukan akibat 5x salah password.

### MODUL 8: KEUANGAN STUDIO (PEMBUKUAN KAS HARIAN)
*Terpisah mutlak dari AdSense. Berfungsi untuk pencatatan arus kas operasional studio.*
1. **Mini-Dashboard Visualisasi Finansial:**
   - 3 Kartu Saldo Kas: Total Pemasukan (🟢), Total Pengeluaran (🔴), Sisa Saldo Kas (🟡 Gold Glow).
   - Widget Rasio Arus Kas: Bar perbandingan persentase Pemasukan vs Pengeluaran.
   - Widget 3 Pengeluaran Terbesar Bulan Ini: Bar visual kategori dengan pengeluaran terbanyak.
2. **Susunan Kolom Baku Tabel Keuangan:**
   - 1) Tanggal Transaksi (`YYYY-MM-DD`)
   - 2) Deskripsi Transaksi
   - 3) Kategori (Dropdown dinamis + tombol `[+ Tambah Kategori Baru]` yang otomatis tersimpan permanen ke pilihan dropdown)
   - 4) Tipe Transaksi (🟢 `Pemasukan` / 🔴 `Pengeluaran`)
   - 5) Nominal (Format Rupiah: `Rp x.xxx.xxx`)
   - 6) Bukti Transaksi (Struk/nota transfer dengan tombol `[👁️ Pratinjau]` & `[⬇️ Unduh]`)
   - 7) Foto Fisik Barang (Foto barang/alat studio yang dibeli dengan tombol `[👁️ Pratinjau]` & `[⬇️ Unduh]`)
   - 8) Dicatat Oleh (Nama Admin / Staf Finance yang menginput)
   - 9) Aksi: Edit & Hapus ke Tong Sampah (Khusus Admin).
3. **Otomatisasi Google Drive Keuangan:**
   - `Keuangan Studio / Bukti Transaksi / [Tahun-Bulan] / Nota_[ID].jpg`
   - `Keuangan Studio / Foto Barang / [Tahun-Bulan] / Barang_[ID].jpg`

### MODUL 9: MATERI EDUKASI (MARKAZ ACADEMY)
1. Pusat video tutorial dan panduan SOP studio.
2. Filter Kategori: `[Semua]` `[Editing]` `[SEO & Judul]` `[Thumbnail]` `[SOP Studio]`.
3. **In-App Lightbox Video Player:** Memutar video langsung di dalam aplikasi (YouTube URL / MP4 Drive) tanpa perlu keluar atau membuka tab baru.
4. Akses materi dikontrol secara spesifik per pengguna melalui Admin Panel.

### MODUL 10: DIREKTORI TOOLS EKSTERNAL
1. Pusat persenjataan alat produksi dengan **3 Sifat Peluncuran Tool**:
   - **Tipe 1: In-App Workspace (Buka di Dalam Aplikasi):** Untuk tool HTML / Gemini AI Canvas (Generator Visual Canvas & Generator Metadata Canvas). Terbuka dalam modal ruang kerja layar penuh tanpa tab baru.
   - **Tipe 2: Web Link Eksternal (Buka Tab Baru):** Untuk platform luar (ChatGPT, Canva, Midjourney, ElevenLabs, YouTube Studio). Membuka tab baru di browser (`target="_blank"`).
   - **Tipe 3: Download Installer / Software (Unduh File):** Untuk software desktop/installer (CapCut PC, OBS, plugin). Tombol unduh file langsung dari Google Drive.
2. Filter kategori tool & kontrol akses granular per pengguna dari Admin Panel.

### FITUR SISTEM: LONCENG NOTIFIKASI & TONG SAMPAH (SOFT DELETE)
1. **In-App Notification Center (Lonceng Pintar):**
   - Menampilkan pengingat: Channel yang jam publish-nya tiba hari ini, channel overdue, akun baru butuh persetujuan (*Pending Approval*), dan akun pengguna yang dibekukan akibat 5x salah password.
2. **Sistem Soft Delete & Tong Sampah (Trash Bin):**
   - Data terhapus masuk ke status `Archived/Deleted`.
   - Menu Tong Sampah khusus Admin untuk me-*restore* (mengembalikan) jika salah hapus, atau menghapus permanen (*Hard Delete*).

---

## 5. DESAIN BASIS DATA (GOOGLE SHEETS SCHEMA - 8 TAB RESMI)
*Aturan Mutlak: Nama tab sheet dilarang menggunakan karakter underscore ("_").*

1. **Tab Sheet: `DataChannel`**
   - `ID Channel`, `Logo Channel URL`, `Nama Channel`, `Link YouTube`, `Subscribers`, `Jam Tayang`, `Pengelola`, `Kategori`, `Niche`, `Status Channel`, `Monetisasi`, `Jam Publish`, `Tanggal Pengerjaan Berikutnya`, `Folder Drive ID`, `Aset Visual URL`, `Aset Audio URL`, `Aset Thumbnail URL`, `Judul Video Default`, `Deskripsi Video Default`, `Riwayat Pendapatan JSON`, `Email Terkait ID`, `Status Hapus` (`Active` / `Deleted`).

2. **Tab Sheet: `DataEmail`**
   - `ID Email`, `Alamat Email`, `Password`, `Kunci 2FA`, `Nomor Pemulihan`, `Email Pemulihan`, `Kode Cadangan`, `Pemilik`, `Catatan`, `Status Hapus`.

3. **Tab Sheet: `DataAdSense` (KHUSUS ADMIN)**
   - `ID Record`, `ID AdSense Google`, `Email AdSense`, `Password`, `Kunci 2FA`, `Email Pemulihan`, `Nomor Pemulihan`, `Nama Sesuai KTP`, `Nama Bank & No Rekening`, `Nama di Rekening`, `Status PIN`, `Status Verifikasi`, `Foto KTP Drive URL`, `Folder Drive KTP ID`, `Status Hapus`.

4. **Tab Sheet: `DataUsers` (DATABASE PENGGUNA — 26 KOLOM TERKINI)**
   - `User_ID`, `Nama_Lengkap_KTP`, `NIK`, `Nomor_WhatsApp`, `Alamat_Domisili`, `Email_Login`, `Password`, `Role`, `Foto_Profil_URL`, `Foto_KTP_URL`, `Nama_Bank`, `Nomor_Rekening`, `Nama_di_Rekening`, `Tanggal_Bergabung`, `Status_Akun` (`Aktif`/`Pending Approval`/`Dibekukan`/`Suspended`), `Salah_Password_Count`, `Izin_Akses_JSON`, `Last_Login`, `Status_Hapus`, `Foto_Wajah_URL`, `Foto_Selfie_KTP_URL`, `KYC_Status`, `KYC_Deadline_At`, `Last_Active_At`, `KYC_Verified_At`, `KYC_Note`.

5. **Tab Sheet: `DataKeuangan`**
   - `ID Transaksi`, `Tanggal`, `Deskripsi`, `Kategori`, `Tipe` (`Pemasukan`/`Pengeluaran`), `Nominal`, `Bukti Nota Drive URL`, `Foto Barang Drive URL`, `Dicatat Oleh`, `Status Hapus`.

6. **Tab Sheet: `DataKategoriKeuangan`**
   - `ID Kategori`, `Nama Kategori`, `Tipe Transaksi`, `Dibuat Oleh`.

7. **Tab Sheet: `DataMateri`**
   - `ID Materi`, `Judul Materi`, `Kategori`, `Link Video`, `Deskripsi`, `Tanggal Rilis`, `Status Hapus`.

8. **Tab Sheet: `DataTools`**
   - `ID Tool`, `Nama Tool`, `Kategori`, `Tipe Peluncuran` (`InApp`/`ExternalWeb`/`Download`), `URL Tool / File Drive ID`, `Deskripsi`, `Icon FontAwesome`, `Status Hapus`.

---

## 6. ATURAN VALIDASI & REKAYASA SISTEM
1. **Penomoran Otomatis Sekuensial:** `PREFIX-YYYYMM-XXX` anti-tabrakan dengan `LockService`.
2. **Indeks Kolom Berbasis Array (0-Based Constant):** Backend kebal modifikasi nama header melalui konstanta `COL.*`.
3. **Pembersihan Kode Cadangan Otomatis:** Input multi-baris otomatis dibersihkan menjadi koma sebelum disimpan ke database.
4. **Penyimpanan Snapshot Pendapatan Bulanan:** Di bulan berjalan bersifat mengganti (*replace*), saat pergantian bulan otomatis tercatat ke riwayat channel.
5. **Auto-Rename Drive File:** Seluruh upload foto KTP, bukti nota, dan foto barang otomatis di-rename rapi sesuai standar.
6. **Flush Backend:** Setiap mutasi data diakhiri `SpreadsheetApp.flush()`.

---

## 7. KRITERIA PENGUJIAN SISTEM (ACCEPTANCE CHECKLIST)
- [ ] Pengguna baru mendaftar berstatus Pending, tidak bisa login sebelum di-ACC Admin.
- [ ] Salah password 5x berturut-turut otomatis membekukan akun.
- [ ] Admin Panel dapat mengatur izin akses modul, checklist materi, dan checklist tools per pengguna.
- [ ] Database AdSense hanya bisa dibuka dan diakses oleh Admin.
- [ ] Dashboard murni berisi 6 KPI dan 2 Leaderboard (Nol target upload).
- [ ] Jadwal pengerjaan menampilkan Target Upload Hari Ini dengan Jam Publish Paten (tidak berubah).
- [ ] Tombol [Selesai Pengerjaan] meminta input Subs/Jam (Belum Monet) atau Pendapatan (Sudah Monet), pendapatan mengupdate bulan berjalan.
- [ ] Tabel Database Channel menampilkan 10 kolom baku mandiri, pemisahan Kategori vs Niche, dan relasi ke Database Email.
- [ ] Keuangan studio menampilkan mini-dashboard visualisasi, dropdown kategori dinamis, serta upload Bukti Nota & Foto Fisik Barang ke Drive terpisah.
- [ ] Tools dapat dibuka dalam 3 mode: In-App Canvas Workspace, Web Tab Baru, dan Download File.
- [ ] Seluruh data yang dihapus masuk ke Tong Sampah (Soft Delete) dan bisa di-restore oleh Admin.

================================================================================
ZONA 2: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================

### 1. STATUS LINGKUNGAN AKTIF
- **Arsitektur:** Google Apps Script Modular Web App (`code.gs`, `setup.gs`, `index.html`, `css.html`, `modals.html`, `js.html`).
- **Database:** Google Sheets Cloud Database (12 Tab Resmi — termasuk `DataLaporanKerja` & `DataRekapHarian`) & Google Drive API Storage.
- **Model Pengguna:** Flat Two-Tier Model (Admin Panel Master vs Pengguna Mandiri).

### 2. LOGIKA BISNIS RESMI
- **Papan Peringkat Belum Monet:** $\text{Skor} = (\text{Subscribers} \times 1) + (\text{Jam Tayang} \times 2)$ (Descending).
- **Papan Peringkat Sudah Monet:** Menggunakan angka Estimasi Pendapatan Bulan Berjalan terbesar (Descending).
- **Pendapatan Studio:** Akumulasi pendapatan bulan aktif seluruh channel monet milik user yang sedang aktif.

### 3. LOG PEMBARUAN RESMI
- **REV-10.0 (FINAL RECONSTRUCTION & COMPLETE STUDIO OS BLUEPRINT):** Rekonstruksi total cetak biru sistem mencakup 10 modul murni, struktur peran 2-tingkat dengan Admin Control Center granular, sistem approval registrasi & anti-brute force 5x fail, pemisahan mutlak AdSense vs Keuangan, penambahan Database Pengguna (KYC KTP & Rekening), upload Foto Barang & Bukti Nota di Keuangan, 3 tipe peluncuran tool (In-App Canvas, New Tab, Download), serta sistem Tong Sampah (Soft Delete). Seluruh spesifikasi lama yang usang telah dibersihkan 100%.
- **REV-10.2 (EMAIL CREDENTIALS & 2FA STABILIZATION):** Sinkronisasi Kunci 2FA backend/frontend multi-alias, deteksi otomatis pemilik akun dari sesi login pengguna aktif (`readonly` field), serta integrasi tombol aksi detail (`eye` icon) dan modal kredensial interaktif (`modalDetailEmail`) dengan 1-click copy & password reveal toggle.
- **REV-10.3 (EMAIL FILTERS, TOTAL COUNTER & PAGINATION):** Penambahan badge counter total email aktif di header view (`#emailTotalBadge`), toolbar filter dinamis berbasis pemilik akun (`ownersList`) dengan reset button, serta dock pagination responsif dengan pilihan ukuran baris 10, 20, 50, dan 100 per halaman.
- **REV-10.4 (CHANNEL DATABASE REFINEMENT & MULTI-ASSET G-DRIVE MANAGEMENT):** Penambahan badge total channel aktif (`#channelTotalBadge`), pembersihan penomoran header tabel, perbaikan klik icon folder dengan ID-lookup aman, penambahan icon mata detail channel & pemisahan modal profil akun (`#modalDetailChannel`) vs modal aset multimedia (`#modalChannelAssets`), integrasi upload file Drive thumbnail & audio dengan live player preview, integrasi paste link video, harmonisasi status `Aktif` dan logika kolom monetisasi (Jam Tonton vs Pendapatan), serta pemuatan dinamis opsi Kategori & Niche dari tab spreadsheet `DataDropdownMaster`.
- **REV-10.5 (POPUP FORM CLEANUP & EMAIL DROPDOWN ACTIVATION):** Pembersihan tuntas blok input lama "Aset Google Drive & Default Metadata" dari modal formulir Channel (`#modalForm`) agar tampilan bersih dan proporsional. Aktivasi dropdown Akun Email Terkait (`#channelEmailId`) terhubung dinamis ke sheet `DataEmail` dengan format `email (pemilik)` serta sinkronisasi otomatis terpilih (*pre-selected*) saat mode Edit Channel.
- **REV-10.6 (SEARCHABLE EMAIL COMBBOX, MULTI-UPLOAD & HIERARCHICAL DRIVE SYSTEM):** Implementasi Smart Searchable Email Combobox (`#channelEmailSearchInput`, filter real-time, counter cocok, dan tombol reset link), antrean multi-file batch upload untuk Thumbnail & Audio (`multiple` file input + sequential async queue), serta hierarki folder otomatis Google Drive bertingkat di bawah folder utama `DoGo Studio V1` (`Aset Channel/[Nama Channel]/[Thumbnail|Audio|Visual]`, `Database AdSense/[Nama Sesuai KTP]`, `Database Pengguna/[Nama Pengguna]`, dan `Keuangan Studio`).
- **REV-10.7 (FIX EDIT CHANNEL TIME/NICHE & INTERACTIVE 2-COLUMN SCHEDULE REDESIGN):** Mengatasi bug jam publish hilang saat edit dengan normalizer `normalizeTimeHHmm` (`14.00` -> `14:00`) dan tanggal `normalizeDateYYYYMMDD`, mengubah input Niche menjadi teks bebas mandiri, mengubah tombol aksi menjadi `[ ▶ Mulai Kerjakan ]` dengan modal 2 opsi (`#modalMulaiKerjakan` untuk Lihat Aset vs Selesai & Pindah Jadwal), serta meredesain tampilan Jadwal Pengerjaan menjadi Split Layout 2-Kolom interaktif (Kalender 7-kolom dengan chip nama channel + Sidebar Antrean/Tanggal Terpilih dengan dropdown dan pill filter nama tim/pengguna khusus Admin Panel).
- **REV-10.8 (FINANCE MODULE UPGRADE: CLEAN HEADERS, PREVIEW MODAL, DUAL-INPUT UPLOAD & FILTERS):** Pembersihan penomoran statis pada header tabel kas keuangan dan penggantian label menjadi `FOTO BARANG`, penambahan tombol interaktif `[ 👁️ Lihat ]` dengan modal lightbox pratinjau (`#modalFinancePreview`) untuk Bukti Nota & Foto Barang, penambahan fitur dual-input (tombol upload file langsung ke Google Drive studio + paste URL manual) pada form transaksi kas (`#modalTransaksiKeuangan`), serta penambahan bilah filter cerdas (`#financeFilterPeriode`, `#financeFilterTipe`, dan kolom pencarian real-time).
- **REV-10.9 (FIX TRASH ACTION & GOOGLE DRIVE EMBED PREVIEW IN FINANCE MODULE):** Pemulihan 100% tombol Hapus / Tong Sampah (`deleteFinanceByIndex`) dengan event binding berbasis indeks memori kebal string-quoting & fallback `rowIndex` spreadsheet, auto-healer ID transaksi (`TRX-XXXX`) untuk baris legacy pada sheet `DataKeuangan`, serta rekonstruksi modal pratinjau (`#modalFinancePreview`) menggunakan embed resmi Google Drive (`/preview` dalam iframe) yang sepenuhnya mengeliminasi error CORS/403 Forbidden pada Bukti Nota dan Foto Barang.
- **REV-10.10 (ACCURATE CURRENCY PARSING & REACTIVE FINANCE DASHBOARD):** Implementasi parser mata uang universal (`parseNominalAmount`) di backend dan frontend untuk mengatasi pemotongan ribuan titik khas Indonesia (`parseFloat` pada `20.000.000` yang sebelumnya menghasilkan `20`), pembacaan ganda raw numeric value `getValues()` dan format display `getDisplayValues()`, rekayasa dashboard KPI reaktif di `applyFinanceFilters()` yang otomatis menghitung ulang Total Pemasukan, Total Pengeluaran, Saldo Kas, Rasio Arus Kas, dan Top 3 Pengeluaran sesuai rentang filter yang aktif (Semua Periode, Bulan Ini, dsb.), serta integrasi live formatting helper teks pada form input nominal.
- **REV-10.11 (FIX DRIVE UPLOAD PROPERTY MISMATCH & SPREADSHEET SYNC):** Mengatasi bug ketidakcocokan nama properti URL hasil upload file (`fileUrl` vs `url`) pada `uploadStudioFile` dan `handleFinanceUpload` yang sebelumnya memicu toast ambigu *"Gagal mengunggah file: File berhasil diunggah ke Google Drive!"* dan menyebabkan link Bukti Nota / Foto Barang tidak tersalin ke input form sehingga kolom spreadsheet kosong. Kini mengembalikan dual-property (`fileUrl` & `url`), auto-populate instan ke field form, dan aktivasi chip visual sukses secara mulus.
- **REV-10.12 (REGISTRATION SIMPLIFICATION, LOGIN POLISH & USER DATABASE MANAGEMENT):** Penghapusan input wajib NIK pada formulir pendaftaran anggota baru (`#modalRegister`) dan penataan input nomor WhatsApp menjadi proporsional; penggantian placeholder email pada modal login (`#modalLogin`) dari `admin@dogostudio.com` menjadi placeholder netral `nama@email.com`; standarisasi penamaan menu navigasi dan header view dari "Database Pengguna & KYC" menjadi "Database Pengguna"; eliminasi kolom NIK pada tabel pengguna (penyesuaian menjadi 8 kolom baku); penambahan toolbar icon aksi pada kolom Aksi mencakup tombol icon Lihat (`fa-eye`) dan tombol icon Edit (`fa-pen-to-square`) dengan event binding berbasis indeks memori; penambahan Modal Detail Profil Pengguna (`#modalDetailUser`) dengan kartu avatar, badge status, tautan langsung WhatsApp, dan detail rekening bank; penambahan Modal Edit Pengguna (`#modalEditUser`) beserta backend handler `updateUserProfile` di `code.gs` untuk pembaruan identitas, role, status akun, nomor rekening, dan reset password aman.
- **REV-10.13 (ACCESS CONTROL HARDENING, FINANCE LOCKDOWN & LIVE SESSION SYNC):** Penguncian menyeluruh kebocoran izin akses pengguna. Pengetatan fungsi `hasPermission` dengan parsing string aman dan default tertutup (`false`) khusus modul Keuangan Studio bagi non-admin; integrasi gerbang keamanan backend `canAccessFinance` pada seluruh fungsi data kas (`getFinanceData`, `saveFinanceTransaction`, `deleteFinance`); penyembunyian dinamis navigasi sidebar `#nav-finance`, `#navSectionFinance`, `#nav-database`, `#nav-emails`, dan `#nav-jadwal` di `applyUserSessionUI()` jika hak akses tidak dimiliki; penambahan router guard universal di `switchView`; perbaikan parsing objek pada modal perizinan (`openGranularPermsModal` & `openGranularPermsModalByIndex`); serta implementasi fungsi backend `syncUserSession` dan pemanggil live `syncLiveUserSession()` saat pemuatan aplikasi yang secara instan menyinkronkan izin pengguna dari database Google Sheets ke browser tanpa harus logout manual.
- **REV-10.14 (CHANNEL PENGELOLA FILTER, DIRECT EMAIL CREDENTIAL BRIDGE & RESPONSIVE VIEWPORT REPAIR):** Implementasi 3 penyempurnaan utama: (1) Penambahan dropdown `<select id="filterPengelola">` pada toolbar Database Channel yang terintegrasi langsung dengan parameter backend `getChannelsData(params.pengelola)` dan auto-populate daftar unik pengguna aktif `pengelolaList`; (2) Integrasi jembatan kredensial 1-klik dari Modal Detail Channel (`#modalDetailChannel`) ke Modal Kredensial Email (`#modalDetailEmail`) via API backend `getEmailDetailByAddressOrId` lengkap dengan tombol navigasi balik (`#btnEmailBackToChannel` & `#btnEmailBackToChannelFooter`) tanpa perlu pindah menu atau mencari manual; (3) Perbaikan total layout responsif layar laptop kecil (1366x768 / 1024x768) dan window minimized dengan mengatasi flexbox overflow pada `<main>` (`md:w-[calc(100%-18rem)] min-w-0 max-w-full overflow-x-hidden`), layout KPI grid adaptif (`grid-cols-2 sm:grid-cols-3 xl:grid-cols-6`), split layout jadwal adaptif (`xl:grid-cols-12`), dan scroll horizontal internal pada seluruh kontainer tabel data.
- **REV-10.15 (ADMIN PANEL USER FILTER & UNIVERSAL STICKY FROZEN TABLE HEADERS):** Penuntasan 2 penyempurnaan utama: (1) Pembersihan toolbar Database Channel dari dropdown filter pengguna (`filterPengelola`) agar toolbar kembali lapang dan elegan, dialihkan secara khusus ke toolbar Admin Panel (Database Pengguna) dengan penambahan filter status akun dinamis (`#userFilterStatus`: Aktif, Pending Approval, Dibekukan) yang ditenagai oleh controller instan `filterUsersByStatus()` dan memori cache `masterUsersCache`; (2) Penerapan arsitektur pembekuan baris header tabel (*Freeze Header / Sticky Table Engine*) secara universal di seluruh tabel aplikasi (`.table-scroll-container`, `.table-scroll-container-finance`, dan `.table-sticky-header`) pada Database Channel, Database Email, Keuangan Studio, Database AdSense, Database Pengguna, dan Modal Riwayat Pendapatan Channel. Menggunakan `position: sticky; top: 0; z-index: 20; background: #0a1710 !important;` dengan `border-collapse: separate; border-spacing: 0;` sehingga saat pengguna menggulir ke bawah (*scroll down*) untuk melihat baris-baris daftar, seluruh baris judul kolom tetap beku dan terkunci kokoh di posisinya (*anti-geser/anti-hilang*), dan hanya baris-baris data yang meluncur mulus di bawahnya.
- **REV-10.16 (CRITICAL SECURITY HARDENING, BUG REMEDIATION & FUNCTIONAL UPGRADES):** Peningkatan keamanan menyeluruh dan perbaikan bug sistem: (1) Pengamanan otentikasi server-side token (`CacheService` + `PropertiesService` 6 jam) melalui `authenticateSession(userSession)` di seluruh endpoint `code.gs`, hashing kata sandi salted SHA-256 (`sha256$<salt>$<hash>`) dengan auto-migrasi transparan akun plaintext saat login, alur Lupa Sandi 2-tahap OTP 6-digit via `MailApp` (cooldown 60 detik, TTL 10 menit, max 5 percobaan), pencabutan sesi saat logout/reset/freeze/delete, validasi MIME + batas 10 MB unggahan Drive, penegakan hak akses `PRIVATE` pada berkas KTP lengkap dengan proxy `getProtectedDriveImage`, penghapusan Clickjacking `ALLOWALL` ke `XFrameOptionsMode.DEFAULT`, sanitasi URL `sanitizeHttpUrl` + `rel="noopener noreferrer"`, penghapusan injeksi handler inline menjadi pola `ByIndex(idx)`, serta pembersihan menyeluruh cache RAM saat logout (`clearAllClientMemoryCaches`); (2) Perbaikan bug pemetaan 10 kolom `getEmailDetailByAddressOrId`, pencari aset lintas cache `findChannelByIdAnywhere` & lampiran aset di `getCalendarSchedule`, multi-alias field & preservasi `Folder_Drive_ID` AdSense, tanggal WIB `Asia/Jakarta` & `normalizeDateBackend` di Dashboard/Schedule/Finance, pengaktifan input `#finNominal` bertipe `text` + hak aksi `add/edit/delete` + whitelist Materi/Tools dinamis di `modalGranularPermissions`, serta penyatuan form submit handler tanpa duplikasi; (3) Upgrade UI/UX berupa upload KTP langsung di AdSense & Edit Pengguna, halaman **Log Aktivitas & Audit Studio** (`#view-logs`), **Profil Saya & Ganti Kata Sandi** (`#modalMyProfile`), **Export CSV** Keuangan (aman dari formula injection), tombol **Reset Filter** Database Channel, pembungkus scroll horizontal `min-w-[600px]` pada kalender Jadwal mobile, serta pesan galat inline & indikator loading tabel.

### 4.18 REV-10.17 (Pondasi Publik: Verifikasi Pendaftaran Akun Wajib Email Asli & OTP 2-Tahap)
- **Zero Fake Email Policy:** Seluruh pendaftaran akun baru melalui antarmuka web wajib melewati verifikasi kepemilikan email aktif secara langsung sebelum data dapat dimasukkan ke database Google Sheet `DataUsers`.
- **Backend Gas Engine (`requestRegistrationOtp` & `confirmRegistrationWithOtp`):**
  - Mengamankan data pendaftaran sementara di `CacheService` dengan hashing Salted SHA-256 pada kata sandi dan kode OTP (TTL 15 menit).
  - Rate limiting cooldown 60 detik per alamat email.
  - Batas maksimal 5 kali percobaan kode OTP sebelum sesi pendaftaran hangus secara otomatis.
  - Pengiriman email resmi verifikasi pendaftaran akun baru menggunakan `MailApp.sendEmail`.
  - Penyisipan akun ke Google Sheet `DataUsers` dengan status `Pending Approval` dan pencatatan audit log di `DataLogs`.
- **Frontend Interaktif 2-Step (`#modalRegister`):**
  - Pemisahan langkah pengisian data dan langkah input verifikasi OTP 6-digit.
  - Fitur hitung mundur kirim ulang kode (60 detik) dan navigasi ubah email jika terdapat kesalahan pengetikan alamat email.

### 4.19 REV-10.18 (Self-Service Identity Verification: Integrasi NIK & Upload Foto KTP Mandiri)
- **Kelengkapan Identitas Pengguna:** Menutup celah ketidaksinkronan antara skema `DataUsers` (Kolom 3: NIK & Kolom 10: Foto KTP) dengan antarmuka pengguna mandiri (`#modalMyProfile`).
- **Unggah & Pratinjau KTP Mandiri:**
  - Pengguna/staf yang login dapat mengisi nomor NIK (16 digit) dan mengunggah dokumen KTP langsung ke Google Drive privat (`DoGo Studio V1/Database Pengguna/<Nama>`).
  - Akses `uploadStudioFile` diperluas dengan aman untuk mengizinkan pengguna mengunggah dokumen identitas miliknya sendiri (`isSelfUserKtp`).
  - Endpoint `getProtectedDriveImage` mengizinkan pengguna membuka pratinjau gambar KTP miliknya sendiri secara aman tanpa mengekspos izin publik Drive.
  - Penyimpanan `updateMyProfileAndPassword` memetakan kolom 3 (`NIK`) dan kolom 10 (`Foto_KTP_URL`) secara presisi ke spreadsheet `DataUsers`.

### 4.20 REV-10.19 (Sistem Hak Akses Granular v2: Matriks 11 Modul, Mode Read-Only, Scope Global, & Isolasi Data Sensitif)
- **Matriks Izin 11 Modul (`Izin_Akses_JSON` v2):** Mendukung kontrol granular per modul (`dashboard`, `jadwal`, `channel`, `email`, `finance`, `materi`, `tools`, `adsense`, `users`, `logs`, `trash`) dengan izin aksi terpisah (`view`, `add`, `edit`, `delete`) sekaligus menjaga 100% kompatibilitas mundur bagi format v1 lama (`modules`/`actions`/`timCan*`).
- **Template Peran Cepat 1-Klik (`#modalGranularPermissions`):** Menyediakan 4 preset otomatis (`executive`, `auditor`, `operator`, `finance`) beserta pemilih **Cakupan Data (`scope`: `mine` vs `all`)** dan **3 Sakelar Data Sensitif (`viewCredentials`, `viewKtp`, `exportFinance`)**.
- **Dukungan Mode Lihat Saja (Read-Only) di Keuangan Studio & Admin Panel:** Pengguna eksekutif atau pengawas dapat diberi `scope: "all"` dan izin `view: true` pada `Dashboard Eksekutif`, `Keuangan Studio`, `Database AdSense`, `Database Pengguna`, `Log Aktivitas`, dan `Tong Sampah` tanpa tombol Tambah/Edit/Hapus/Approve/Restore, lengkap dengan lencana **Mode Lihat Saja** di antarmuka dan penyaringan ulang view awal (`getFirstAllowedView`) saat login.
- **Masking Kredensial & Isolasi KTP Server-Side (`code.gs`):** Kredensial (`password`, `kunci2fa`, `kodeCadangan`), pratinjau/URL KTP (`fotoKtpUrl` di Users & AdSense), dan `getProtectedDriveImage` dijaga di server agar tidak bocor apabila `viewCredentials` / `viewKtp` dinonaktifkan.
- **Anti-Privilege-Escalation Mutlak:** Perubahan izin (`updateUserPermissions`), tombol **Izin Akses**, pengelolaan akun Admin/Super Admin, dan pengangkatan role ke Admin/Super Admin tetap dikunci eksklusif hanya untuk Super Admin.
- **Verifikasi Lintas Suite:** Terverifikasi melalui `scratch/validate_rev_10_19.js` (`114/114` lulus) dan seluruh suite regresi (`10_18`, `10_17`, `10_16`, `10_15`, `10_13`) dengan 0 kegagalan.

### 4.21 REV-10.20 (Sistem Laporan Kerja Harian Zero-Friction, Auto-Timestamp WIB & Bot Rekap Otomatis 23:00 WIB ke Owner)
- **Database Baru Tanpa Underscore (`setup.gs` & `code.gs`):** Menambahkan sheet `DataLaporanKerja` (`ID_Laporan`, `Tanggal_WIB`, `Waktu_WIB`, `ID_User`, `Nama_User`, `Email_User`, `Kategori_Tugas`, `Channel_Terkait`, `Keterangan`, `Sumber_Pencatatan`, `Ref_ID`, `Status_Hapus`) dan `DataRekapHarian` (`ID_Rekap`, `Tanggal_Laporan`, `Waktu_Kumpul_WIB`, `Total_Staf_Aktif`, `Total_Staf_Melapor`, `Total_Aktivitas`, `Ringkasan_JSON`, `Status_Kirim_Email`) menggunakan Safe Migration & index mapping (`COL_LAPORAN`, `COL_REKAP`).
- **6 Kategori Tugas Kerja Baku:** `Buat Email`, `Buat Channel`, `Cari / Buat Bahan`, `Mengedit`, `Upload`, dan `Menjadwalkan`.
- **Hybrid Zero-Friction Tracking & Kunci Timestamp Server WIB:**
  - *Auto-Capture Otomatis (`Sumber = 'Otomatis'`):* Tercatat seketika di belakang layar saat staf membuat email (`saveEmail`), membuat channel / update link aset bahan / hasil edit video / jadwal publish (`saveChannel` & `recordChannelEditAutoWork`), unggah thumbnail/audio ke Drive (`uploadChannelAsset`), dan menyelesaikan upload/jadwal (`quickUpdateUpload`).
  - *Quick-Log 5 Detik (`Sumber = 'Manual'`):* Tombol `+ Catat Kerja` di header (`#btnQuickWorkLogHeader`) membuka modal `#modalQuickWorkLog` dengan 6 tombol kategori besar, dropdown channel opsional, dan 1 kalimat catatan singkat **tanpa input jam/tanggal** — segala payload jam/tanggal klien diabaikan di backend (`submitManualWorkLog`) dan selalu diisi oleh waktu server `'Asia/Jakarta'`.
- **Dashboard Adaptif & Kendali Owner (`#view-laporan`):**
  - *Mode Staf (`scope: mine`):* Hanya melihat progres kerja miliknya sendiri lengkap dengan penanda status tugas hari ini agar tidak bingung atau melapor ganda.
  - *Mode Owner / Pengawas (`SUPER_ADMIN` / `scope: all`):* Menampilkan 4 KPI tim, sorotan staf aktif yang belum mencatat aktivitas (`0 catatan`), tabel rekap per staf (*Jam Pertama $\rightarrow$ Jam Terakhir WIB* dan rincian 6 kategori), modal detail timeline per jam (`#modalStaffWorkTimeline`), serta kontrol penuh trigger & arsip untuk Super Admin.
- **Mesin Pengumpul Otomatis 23:00 WIB (`runDailyWorkRecapJob` & `compileAndSendDailyWorkRecap`):** Dijadwalkan setiap hari pukul 23:00 WIB (`atHour(23).nearMinute(0)` zona `'Asia/Jakarta'`), bersifat idempoten per tanggal, menyimpan arsip ke `DataRekapHarian`, serta mengirim 1 email ringkasan eksekutif HTML via `MailApp` ke seluruh akun `SUPER_ADMIN` aktif (+ opsional `DAILY_RECAP_EXTRA_EMAILS` di `ScriptProperties`). Dilengkapi tombol **"Aktifkan Jadwal 23:00 WIB"** (serta fallback `initDailyReportTrigger()`) dan **"Kumpulkan & Kirim Rekap Sekarang"** di antarmuka Owner.
- **Ekspansi Matriks Hak Akses (12 Modul):** Menambahkan modul `laporan` (`view`, `add`, `delete`) ke `normalizeUserPermsObj`, `PERM_MATRIX_SPEC`, dan `#modalGranularPermissions`.
- **Verifikasi Lintas Suite:** Terverifikasi melalui `scratch/validate_rev_10_20.js` (`92/92` lulus) dan seluruh 6 suite regresi sebelumnya (`10_19` `114/114`, `10_18` `29/29`, `10_17` `41/41`, `10_16` `59/59`, `10_15` `31/31`, `10_13` `8/8`) tanpa 1 kegagalan pun.

### 4.22 REV-10.21 (Hardening Zero-Trust Anti-Bypass DevTools Console & GAS Function Privatization)
- **Eliminasi Total Backdoor `_serverVerified` (`code.gs`):** `authenticateSession(clientSession)` membuang logika pengembalian objek bertanda `_serverVerified: true` dari klien dan tidak pernah menerbitkan klaim tersebut di JSON. Validasi mutlak hanya mengandalkan `token` acak di `CacheService.getScriptCache()` (+ pemulihan cache bila ter-evict dengan validasi kedaluwarsa, status akun `DataUsers`, dan pencabutan sesi `REVOKED_`). Optimasi performa intra-request dipindahkan ke peta RAM eksklusif server `_REQUEST_AUTH_CACHE_` (TTL 800 ms, dikosongkan otomatis tiap mutasi sesi/izin).
- **Privatisasi Helper Internal GAS (`_` Suffix di `code.gs` & `setup.gs`):** Seluruh helper internal pencetak token (`createServerSession_`, `destroyServerSession_`, `revokeAllSessionsForEmail_`), penyedot analitik/rekap (`computeDailyWorkAnalytics_`, `getOwnerRecapRecipients_`, `compileAndSendDailyWorkRecap_`, `getDailyRecapMetaForOwner_`), pendaftar pra-OTP (`registerUser_`), pembuat log/ID/sheet (`logActivity_`, `generateId_`, `get*Sheet_`, `setupSheet_`, `seedDefault*_`) diprivatkan agar mustahil dipanggil dari browser Console via `google.script.run`. Output `runDailyWorkRecapJob()` dan `initDailyReportTrigger()` disterilkan dari PII, serta `getEmailOptions()` dijaga dengan izin modul `email`/`channel`.
- **Gerbang Verifikasi Token Frontend (`js.html`):** `initApp()` memvalidasi panjang token `localStorage` ($\ge 20$) dan menahan tampilan `#appAuthWrapper` tetap tersembunyi sampai `syncUserSession` di server mengonfirmasi keabsahan token; `applyUserSessionUI()` juga mewajibkan keberadaan `currentUserSession.token`.
- **Verifikasi Penetrasi:** Lulus `scratch/validate_rev_10_21.js` (**88/88 PASSED**) dan 7 suite regresi lainnya (`10_13` s.d. `10_20`) dengan 0 kegagalan.

### 4.23 REV-10.22 (Hardening Gateway & OAuth Google, Upload Compression, UI/UX Polish & PWA v2)
- **Keamanan Gateway & OAuth ([code.gs](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/code.gs), [setup.gs](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/setup.gs), [api/gas.js](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/api/gas.js)):** `verifyGoogleIdToken_()` memvalidasi ID Token ke endpoint `oauth2.googleapis.com/tokeninfo`; `doPost(e)` dilindungi whitelist eksplisit `PUBLIC_API_WHITELIST_` anti-reflection; `api/gas.js` membatasi origin CORS (menghapus `*`) serta daftar `ALLOWED_ACTIONS`; `seedDefaultAdmin_()` mengganti sandi default statis menjadi sandi acak; `uploadStudioFile()` mengunci folder KTP non-admin ke identitas sesi; dan `deleteFinance()` memperketat syarat fallback `rowIndex`.
- **Reliabilitas Frontend & Upload ([js.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/js.html)):** Kompresi gambar `<canvas>` `readFileSafeForUpload()`, batas percobaan `initGoogleSignIn()`, penjagaan layar `#modalLogin` saat `pendingApproval`, render avatar Google `fotoProfil`, callback `onFailure` pada semua form submit & unggahan, error handler HTTP 413/`!response.ok` di `callBackend()`, serta caching `CACHE_TTL_MS` di `loadMateriData` dan `loadToolsData`.
- **UI/UX, Tong Sampah & PWA ([index.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/index.html), [modals.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/modals.html), [css.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/css.html), [sw.js](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/sw.js)):** Simetri 6 kartu KPI mobile, hierarki `z-index` modal bertingkat (`50`/`60`/`70`/`90`), penempatan tombol daftar Google di Step 1 `#formRegister`, banner `#inAppToolFrameHint`, ekspansi filter & backend Tong Sampah untuk modul **Pengguna** & **Laporan**, safe-area iOS pada dock bawah, serta Service Worker `dogo-studio-cache-v2` (*Stale-While-Revalidate*).
- **Verifikasi:** `scratch/validate_rev_10_22.js` (**58/58 PASSED**), `validate_syntax.js` lolos 100%, serta seluruh skrip regresi utama (`10_10`–`10_13`, `10_15`–`10_17`, `10_19`–`10_21`).

### 4.24 REV-10.23 (Login Wajib OTP 48 Jam, Penonaktifan Google Login, Registrasi Ringkas 5 Kolom, KYC Kamera Live & Gemini OCR 30 Hari Auto-Suspend, & Foto Profil Mandiri)
- **Keamanan Autentikasi & OTP 48 Jam ([code.gs](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/code.gs), [setup.gs](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/setup.gs), [api/gas.js](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/api/gas.js)):** Login Google Sign-In dari `REV-10.22` dinonaktifkan penuh; setiap login baru atau akun yang belum membuka aplikasi $\ge 48$ jam (berdasarkan timestamp server WIB `Last_Active_At` di kol. 24 `DataUsers`) wajib lolos **OTP 6-digit email** (`verifyLoginOtp` / `resendLoginOtp`). `syncUserSession` + `authenticateSession` menyegarkan `Last_Active_At` secara berkala (throttle 15 menit). Akun `SUPER_ADMIN` / `OWNER` kebal pembekuan DoS permanen 5x salah sandi melalui mekanisme cooldown `CacheService` 15 menit.
- **Pendaftaran Ringkas 5 Kolom (`requestRegistrationOtp` & `#modalRegister`):** Registrasi tahap 1 dirapikan hanya meminta **Nama Lengkap, Email, No. WA, Kata Sandi, dan Konfirmasi Kata Sandi**, dilanjutkan Step 2 OTP Email sebelum masuk status `Pending Approval`. Alamat lengkap KTP diisi di tahap verifikasi kedua (KYC).
- **Verifikasi Kedua (KYC) Kamera Live, Gemini Vision OCR & Batas 30 Hari Auto-Suspend ([modals.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/modals.html), [js.html](file:///c:/Users/RAZER/.gemini/antigravity-ide/Markaz%20Gacoria%20V1/js.html)):**
  - *Safe Migration `setupSheet_`* menambahkan kolom 20–26 `DataUsers` tanpa memindahkan data lama. Akun aktif mendapat tenggang **30 hari** (`KYC_Deadline_At`) dan banner peringatan `#kycCountdownBanner`.
  - `#modalCameraCapture` menggunakan WebRTC `getUserMedia` (beserta fallback `<input capture>`) khusus untuk mengambil langsung **Foto Wajah**, **Foto e-KTP**, dan **Foto Wajah Memegang KTP** (tersimpan `PRIVATE` di Drive). Pengambilan Foto KTP otomatis memicu `scanKtpWithGemini` (Gemini Vision AI via `GEMINI_API_KEY` di `ScriptProperties`) guna mengisi alamat lengkap & NIK ke `#kycAlamat`/`#kycNik`.
  - Begitu 3 foto kamera + alamat disubmit via `submitUserKyc`, status KYC otomatis menjadi `Terverifikasi`; Owner tetap dapat melakukan audit (`reviewUserKyc` Setujui/Tolak). Melewati batas 30 hari tanpa melengkapi KYC memicu status `Suspended` secara otomatis dan mengarahkan layar login ke tombol **Hubungi Owner via WhatsApp** (`getPublicOwnerContact`), yang hanya bisa dibuka oleh Super Admin (`unsuspendUser`).
- **Ubah Foto Profil Mandiri:** Pengguna dapat mengunggah atau menjepret **Foto Profil** via `#modalMyProfile` (`uploadStudioFile` `user_profile` -> `updateMyProfileAndPassword`), langsung diperbarui pada `#sidebarUserAvatar` & detail pengguna.
- **Verifikasi Pasca-Edit Final:** `validate_syntax.js` lolos 100%, `scratch/validate_rev_10_23.js` (**43/43 PASSED**), serta `validate_rev_10_17.js` (`41/41`), `10_15` (`31/31`), `10_13`, `10_12`, `10_11`, dan `10_10` lulus 100%. *(Skrip pre-REV-10.23 `10_16`, `10_19`, `10_20`, `10_21` berhenti pada pemanggilan langsung `loginUser()` tanpa OTP karena aturan OTP 48 jam pada `loginUser()` kini aktif penuh).*



