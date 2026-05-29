# 🍽️ FlavorDash — Food Detail App

FlavorDash adalah aplikasi mobile berbasis **React Native (Expo)** dan **TypeScript** yang menampilkan detail informasi resep makanan secara dinamis dengan mengintegrasikan API **TheMealDB Lookup API**.

Aplikasi ini dirancang dengan antarmuka modern bernuansa **Dark Mode** premium dan aksen warna oranye khas FlavorDash (`#f97316`), serta mendukung tata letak yang sepenuhnya responsif dan frameless (edge-to-edge).

---

## ✨ Fitur Utama

- **Integrasi API Dinamis**: Mengambil data resep detail secara real-time berdasarkan `mealId` menggunakan endpoint `process.env.EXPO_PUBLIC_API_DETAIL_URL` (TheMealDB).
- **Desain Edge-to-Edge & Frameless**: Gambar makanan tampil penuh hingga ke ujung atas layar melewati status bar untuk memberikan kesan premium modern.
- **Notch & Status Bar Safe**: Posisi badge ID makanan dikalkulasi secara dinamis menggunakan runtime `StatusBar.currentHeight` (Android) & platform detection (iOS) agar tidak terhalang oleh poni/notch kamera.
- **Fully Responsive Flexbox**: Layout adaptif menggunakan aspek rasio (`aspectRatio: 16/10`) dan padding persentase agar tetap rapi di semua ukuran layar smartphone.
- **State Management & UI States**: Dilengkapi dengan indikator loading (`ActivityIndicator`) dengan mikro-animasi titik loading, serta halaman penanganan error jika API gagal diakses atau ID tidak ditemukan.
- **Integrasi AsyncStorage (Penyimpanan Lokal)**: Menyimpan dua variabel data penting secara lokal agar awet saat aplikasi ditutup:
  - **Variabel 1: Status Favorit (`isFavorite`)** — Menggunakan key `@fav_[mealId]` untuk menyimpan status bookmark resep. Status ini dihubungkan dengan tombol interaktif berbentuk Hati (❤️/🤍) di atas gambar makanan.
  - **Variabel 2: Riwayat Terakhir Dilihat (`lastViewedName`)** — Menggunakan key `@last_viewed_name` untuk mengingat nama resep terakhir yang berhasil dibuka oleh user, dan menampilkannya dalam bentuk banner "Terakhir dilihat" di atas judul resep.
- **TypeScript Strict Mode**: Keamanan tipe data dengan interface strict (`IMeal` & `IMealApiResponse`).

---

## 🛠️ Tech Stack & Spesifikasi

- **Framework**: Expo (React Native) - SDK 54 (Downgraded untuk kompatibilitas penuh dengan versi Expo Go di perangkat Anda)
- **Bahasa**: TypeScript
- **Styling**: Vanilla React Native StyleSheet
- **API Sumber**: TheMealDB Lookup API (`https://www.themealdb.com/api/json/v1/1/lookup.php`)

---

## 📂 Struktur Folder Utama

```text
FlavorDash/
├── .env                     # Konfigurasi Endpoint API
├── App.tsx                  # Entry point aplikasi (mengatur demo mealId)
├── app.json                 # Konfigurasi dasar Expo (Dark Mode enabled)
├── tsconfig.json            # Konfigurasi TypeScript
├── expo-env.d.ts            # Referensi file tipe data Expo global
└── screens/
    └── FoodDetailScreen.tsx # [FITUR UTAMA] Halaman Detail Resep Makanan
```

---

## 🚀 Cara Menjalankan Project

1. **Masuk ke direktori project**:
   ```bash
   cd c:\codingVibes\kuliah\mk-pemogramanMobile\FlavorDash
   ```

2. **Install Dependensi** *(Sudah otomatis terinstall)*:
   ```bash
   npm install
   ```

3. **Jalankan Expo Server**:
   ```bash
   npm start
   ```

4. **Buka di Perangkat Anda**:
   - Scan QR code menggunakan aplikasi **Expo Go** di Android/iOS Anda.
   - Untuk mengganti resep makanan yang tampil, cukup ubah nilai `DEMO_MEAL_ID` di file [App.tsx](file:///c:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/App.tsx) (contoh: `52772` untuk Teriyaki Chicken Casserole, `52771` untuk Spicy Arrabiata Penne, `52774` untuk Pad See Ew).
