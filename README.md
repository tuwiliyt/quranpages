# 📖 Mushaf Al-Qur'an Standar Indonesia (Web App)

Aplikasi Al-Qur'an Web resmi berstandar **Mushaf Indonesia 15 Baris (LPMQ Kementerian Agama RI & Madani 604 Halaman)** dengan kesesuaian cetakan presisi, kaligrafi asli per halaman, audio Murottal tersinkronisasi kata demi kata (*Karaoke-style Real-Time Highlighter*), dan 100% aset data lokal bebas jeda loading.

---

## ✨ Fitur Utama

- 📐 **Kesesuaian 604 Halaman Mushaf Cetak (15 Baris & Ayat Pojok):**
  - Mengadopsi struktur penggalan baris persis seperti mushaf fisik (Madani 15-lines & Kemenag RI).
  - Setiap kata pada baris 1 s/d 15 ditempatkan sesuai posisi cetakannya dari ujung kanan ke ujung kiri.
  - Spanduk ornamen Kepala Surah (*Surah Header*) dan kaligrafi Basmalah pada awal surah.
- 🎨 **Tipografi & Font Kaligrafi Asli Per Halaman:**
  - Default: **Standar Madinah (King Fahd Complex QCF V2)** dengan 604 file font lokal (`p1.woff2` s/d `p604.woff2`).
  - Font Resmi **LPMQ Isep Misbah** (Kementerian Agama RI).
  - Font **KFGQPC Uthman Taha Naskh**.
- 🎤 **Audio Murottal Karaoke Real-Time (60 FPS):**
  - Kata yang sedang dibaca Qari **menyala emas secara real-time** dengan akurasi milidetik (*Word-by-Word Synchronized Highlighting*).
  - Kata yang sudah dibaca diberi penanda hangat agar pembaca mudah mengikuti alur bacaan.
  - **Pilihan 6 Qari Ternama:** *Mishary Rashid Alafasy, Abdurrahman As-Sudais, Maher Al-Muaiqly, Mahmoud Khalil Al-Husary, Abdul Basit Abdul Samad, Abu Bakr Al-Shatri*.
  - **Auto-Turn & Continuous Play:** Otomatis membalik ke halaman berikutnya dan melanjutkan bacaan tanpa terhenti.
- 📑 **4 Mode Tampilan:**
  1. **Mode 1 Halaman Mushaf (Page View):** Lembaran 1 halaman mushaf 15 baris berbingkai emas ganda.
  2. **Mode Kitab 2 Halaman (Two-Page Spread):** Halaman genap dan ganjil berdampingan seperti membuka Al-Qur'an cetak fisik.
  3. **Mode Ayat & Terjemah Kemenag (Ayah View):** Tampilan ayat-per-ayat lengkap dengan arti perkata (*word-by-word*), transliterasi Latin, dan terjemahan resmi Kemenag RI.
  4. **Mode Scan Cetakan HD (HD Scan View):** Pindaian beresolusi tinggi (1260px) cetakan mushaf.
- ⚡ **100% Offline & Local Assets:**
  - Seluruh data 604 halaman mushaf dan 114 surah disimpan di `/assets/pages/` dan `/assets/chapters/` untuk membuka halaman instan dalam hitungan milidetik tanpa kuota API.
- 🔍 **Pencarian Cerdas & Bookmark:**
  - Pencarian nama surah, teks arab, dan terjemahan bahasa Indonesia.
  - Penanda Terakhir Baca (*Last Read*) & Bookmark ayat favorit otomatis tersimpan di browser.
- 🌙 **4 Tema Tampilan:**
  - *Kertas Mushaf Klasik (Cream)*, *Clean White*, *Emerald Dark*, dan *OLED Midnight*.
- 🤲 **Doa Khotmil Qur'an & Panduan Tajwid Berwarna:**
  - Doa Khatam Al-Qur'an dan doa-doa pilihan.
  - Panduan hukum tajwid interaktif dengan contoh bacaan.

---

## 🚀 Menjalankan Aplikasi Secara Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/tuwiliyt/quranpages.git
   cd quranpages
   ```

2. **Jalankan Server HTTP:**
   ```bash
   python3 launch_quran_server.py
   # atau
   python3 -m http.server 8000
   ```

3. Buka browser di `http://localhost:8000`.

---

## 📁 Struktur Direktori

```
quranpages/
├── index.html                   # Web Entry Point
├── favicon.svg / favicon.ico    # Favicon Ikon Mushaf
├── css/
│   ├── tailwind.css             # Standalone Production CSS
│   └── mushaf.css               # Styling Ornamen Mushaf & Animasi Karaoke
├── js/
│   ├── app.js                   # Application State & Controller
│   ├── data/
│   │   ├── chapters.js          # Metadata 114 Surah
│   │   ├── juzs.js              # Metadata 30 Juz
│   │   ├── pages_index.js       # Index 604 Halaman
│   │   ├── doas.js              # Doa Khatam & Pilihan
│   │   └── tajwid_rules.js      # Panduan Hukum Tajwid
│   ├── services/
│   │   ├── api.js               # Local Assets Data Client
│   │   └── audio.js             # 60 FPS Karaoke Audio Sync Engine
│   └── components/
│       ├── HeaderNav.js         # Navigasi & Mode Switcher
│       ├── MushafPage.js        # Engine Render 15 Baris Mushaf
│       ├── TwoPageView.js       # Render 2 Halaman Kitab
│       ├── HDScanView.js        # Viewer Cetakan HD Scan
│       ├── AyahListView.js      # Viewer Per-Ayat & Arti Perkata
│       ├── AudioBar.js          # Bilah Pemutar Audio Sticky
│       └── Modals.js            # Modal Surah, Juz, Cari & Pengaturan
└── assets/
    ├── fonts/                   # Font Lokal LPMQ, KFGQPC & 604 QCF V1/V2 Fonts
    ├── pages/                   # Data JSON Lokal 604 Halaman
    └── chapters/                # Data JSON Lokal 114 Surah
```

---

## 📜 Lisensi & Sumber Data
- Data Mushaf, Penggalan Ayat & Font QCF: [Quran.com / King Fahd Glorious Quran Printing Complex](https://quran.com)
- Terjemahan & Font LPMQ: [Lajnah Pentashihan Mushaf Al-Qur'an (LPMQ) Kementerian Agama RI](https://quran.kemenag.go.id)
