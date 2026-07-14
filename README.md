# 🍽️ FlavorDash — Food Delivery & Recipe App

FlavorDash adalah aplikasi mobile berbasis **React Native (Expo)** dan **TypeScript** yang menampilkan katalog makanan, detail resep, fitur kamera bukti penerimaan, serta peta lokasi restoran. Aplikasi dilengkapi dengan sistem autentikasi **JWT (JSON Web Token)** dan navigasi menggunakan **Expo Router**.

Aplikasi ini dirancang dengan antarmuka modern bernuansa **Dark Mode** premium dan aksen warna oranye khas FlavorDash (`#f97316`), serta mendukung tata letak yang sepenuhnya responsif menggunakan **Flexbox**.

---

## ✨ Fitur Utama

### 1. 🍽️ Katalog Makanan
- Halaman katalog yang menampilkan daftar makanan dari **TheMealDB API**.
- Setiap item tersusun dalam **layout row (Flexbox)**: gambar di kiri, informasi di kanan.
- Filter berdasarkan kategori (Beef, Chicken, Seafood, dll.).
- Fitur pencarian resep berdasarkan nama.
- Pull-to-refresh untuk memperbarui data.

### 2. 🔒 Detail Pesanan (Protected Route + JWT)
- Halaman detail resep lengkap dengan instruksi memasak.
- **Hanya bisa diakses oleh pengguna yang sudah login** (dilindungi JWT Middleware).
- AsyncStorage menyimpan:
  - **Status Favorit** (`isFavorite`) — tombol ❤️/🤍 di atas gambar.
  - **Riwayat Terakhir Dilihat** (`lastViewedName`) — banner resep sebelumnya.

### 3. 📷 Fitur Camera
- Mengambil foto sebagai **bukti penerimaan pesanan** menggunakan `expo-image-picker`.
- Preview foto ditampilkan setelah berhasil diambil.
- Fitur konfirmasi dan ambil ulang (retake).

### 4. 📍 Fitur Maps
- Menampilkan **peta lokasi restoran** menggunakan `react-native-maps`.
- Lokasi pengguna saat ini ditampilkan via **GPS** (`expo-location`).
- Menampilkan **5 marker restoran** di sekitar lokasi user dengan callout informatif.
- Dark mode map style sesuai tema aplikasi.

### 5. 👤 Profil & Logout
- Menampilkan informasi akun dan detail autentikasi JWT.
- Tombol logout yang menghapus JWT token dari AsyncStorage.

---

## 🛠️ Tech Stack & Spesifikasi

| Komponen | Teknologi |
|----------|-----------|
| **Framework** | Expo (React Native) — SDK 54 |
| **Bahasa** | TypeScript (Strict Mode) |
| **Routing** | Expo Router v4 (File-based Routing) |
| **Autentikasi** | JWT via reqres.in Mock API |
| **State Management** | React Context (AuthContext) + AsyncStorage |
| **API Sumber** | TheMealDB API |
| **Maps** | react-native-maps |
| **Camera** | expo-image-picker |
| **GPS/Location** | expo-location |
| **Styling** | Vanilla React Native StyleSheet (Flexbox) |

---

## 📂 Struktur Folder

```text
FlavorDash/
├── .env                              # Konfigurasi API endpoints
├── app.json                          # Konfigurasi Expo (scheme, plugins)
├── package.json                      # Dependencies (expo-router, maps, dll)
├── tsconfig.json                     # TypeScript strict config
├── contexts/
│   └── AuthContext.tsx                # JWT Authentication Context (login/logout)
├── app/
│   ├── _layout.tsx                   # Root Layout (AuthProvider wrapper)
│   ├── index.tsx                     # Entry redirect (auth check)
│   ├── login.tsx                     # Halaman Login (JWT Auth)
│   └── (protected)/
│       ├── _layout.tsx               # JWT Middleware Guard
│       ├── (tabs)/
│       │   ├── _layout.tsx           # Bottom Tab Navigator
│       │   ├── catalog.tsx           # Katalog Makanan (Flexbox row)
│       │   ├── maps.tsx              # Peta Lokasi Restoran
│       │   ├── camera.tsx            # Bukti Penerimaan Pesanan
│       │   └── profile.tsx           # Profil & Logout
│       └── detail/
│           ├── _layout.tsx           # Detail Stack Layout
│           └── [id].tsx              # Detail Pesanan (Dynamic Route)
├── screens/
│   └── FoodDetailScreen.tsx          # Legacy (versi sebelum migrasi)
└── assets/                           # Icons, splash screen
```

---

## 🚀 Cara Menjalankan Project

1. **Masuk ke direktori project**:
   ```bash
   cd FlavorDash
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Expo Server**:
   ```bash
   npm start
   ```

4. **Buka di Perangkat**:
   - Scan QR code menggunakan **Expo Go** di Android/iOS.
   - Login dengan credentials:
     - **Email**: `eve.holt@reqres.in`
     - **Password**: `cityslicka`

---

## 📝 Analisis

### A. Alasan Penggunaan Flexbox dan Ukuran Proporsional untuk Responsivitas

#### Mengapa Flexbox?

**Flexbox (Flexible Box Layout)** adalah sistem layout utama di React Native yang memungkinkan penyusunan elemen UI secara fleksibel dan adaptif tanpa harus menentukan posisi pixel secara absolut. Dalam FlavorDash, Flexbox digunakan secara menyeluruh karena beberapa alasan:

1. **Adaptasi Otomatis terhadap Ukuran Layar**:
   Dengan menggunakan properti `flex: 1` pada container dan `flexDirection: "row"` pada card makanan, layout aplikasi secara otomatis menyesuaikan proporsinya di berbagai ukuran layar Android. Tidak perlu menghitung lebar pixel secara manual untuk setiap model HP.

   ```tsx
   // Contoh dari catalog.tsx — Flexbox Row Layout
   mealRow: {
     flexDirection: "row",    // Gambar dan info tersusun horizontal
     alignItems: "stretch",   // Tinggi elemen menyesuaikan
   },
   mealImage: {
     width: "30%",           // Gambar mengambil 30% lebar card
     aspectRatio: 1,          // Proporsi persegi, bukan pixel tetap
   },
   mealInfo: {
     flex: 1,                // Info mengisi SISA ruang setelah gambar
     padding: 14,
   },
   ```

2. **Ukuran Proporsional (Persentase & aspectRatio)**:
   Alih-alih menggunakan `width: 350` (pixel tetap), FlavorDash menggunakan:
   - `width: "100%"` dan `width: "30%"` — persentase dari parent container
   - `aspectRatio: 16/10` — menjaga proporsi gambar tanpa hardcode tinggi
   - `paddingHorizontal: "5%"` — padding yang skalanya mengikuti lebar layar

   Pada layar 360px, padding "5%" = 18px. Pada tablet 768px, padding "5%" = 38px. Selalu proporsional.

3. **flexWrap untuk Multi-baris Otomatis**:
   Category chips dan tag menggunakan `flexWrap: "wrap"` agar otomatis berpindah baris ketika ruang horizontal tidak cukup, tanpa perlu logic tambahan.

4. **Konsistensi Cross-Platform**:
   Flexbox di React Native berperilaku konsisten antara Android dan iOS, sehingga satu codebase menghasilkan layout yang sama di kedua platform.

#### Perbandingan dengan Pixel Tetap

| Aspek | Pixel Tetap | Flexbox + Proporsional |
|-------|------------|----------------------|
| HP kecil (360px) | Bisa overflow/terpotong | Otomatis menyesuaikan |
| Tablet (768px) | Banyak ruang kosong | Memanfaatkan ruang optimal |
| Rotasi layar | Layout rusak | Tetap adaptif |
| Maintenance | Perlu atur ulang tiap ukuran | Satu konfigurasi untuk semua |

---

### B. Perbedaan Stateful Authentication vs Stateless Authentication (JWT)

#### Stateful Authentication

**Stateful Authentication** adalah mekanisme autentikasi di mana **server menyimpan status sesi pengguna** (session state) di memori atau database server.

**Cara Kerja:**
1. User login → Server membuat **session ID** unik.
2. Session ID disimpan di **server memory/database** + dikirim ke client sebagai cookie.
3. Setiap request berikutnya, client mengirim session ID.
4. Server **mencari session ID di storage** untuk memvalidasi identitas user.
5. Logout → Server menghapus session dari storage.

**Kelebihan:**
- Server memiliki kontrol penuh atas sesi aktif.
- Bisa memaksa logout user secara instan (invalidate session).

**Kekurangan:**
- Server harus menyimpan data sesi setiap user aktif → **butuh storage**.
- **Tidak scalable** — jika ada jutaan user, server perlu menyimpan jutaan sesi.
- Sulit di-implementasi pada arsitektur **multi-server** (perlu session sharing).
- Bergantung pada koneksi yang stabil ke server.

---

#### Stateless Authentication (JWT)

**Stateless Authentication (JWT — JSON Web Token)** adalah mekanisme di mana **server TIDAK menyimpan status sesi sama sekali**. Semua informasi autentikasi dikemas dalam token yang dipegang client.

**Cara Kerja:**
1. User login → Server memvalidasi kredensial → **Membuat JWT token** yang berisi data user (payload) + signature.
2. Token dikirim ke client → **Disimpan di client** (di FlavorDash: AsyncStorage).
3. Setiap request berikutnya, client mengirim token di header.
4. Server **memvalidasi token menggunakan signature** (tanpa lookup ke database).
5. Logout → Client menghapus token dari storage lokal.

**Struktur JWT:**
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZXZlIn0.abc123signature
```

**Kelebihan:**
- **Tidak butuh server storage** — server tidak perlu menyimpan apapun.
- **Scalable** — cocok untuk jutaan user karena validasi hanya butuh secret key.
- **Cross-platform** — token bisa digunakan di mobile, web, API, microservices.
- **Offline-friendly** — client bisa memvalidasi sesi tanpa koneksi ke server.

**Kekurangan:**
- Token tidak bisa di-revoke secara instan (harus tunggu expire).
- Ukuran token lebih besar dari session ID.

---

#### Mengapa JWT Dipilih untuk Aplikasi Mobile FlavorDash?

JWT dipilih sebagai metode autentikasi di FlavorDash karena:

1. **Aplikasi mobile sering mengalami koneksi tidak stabil**. Dengan JWT, token disimpan secara lokal di AsyncStorage, sehingga status login tetap terjaga meskipun tidak ada koneksi internet. Stateful auth akan gagal karena harus selalu terhubung ke server untuk validasi session.

2. **Tidak membebani server**. Server tidak perlu mengelola session storage untuk setiap user. Ini sangat penting untuk aplikasi yang memiliki banyak pengguna aktif secara bersamaan.

3. **Cocok dengan arsitektur RESTful API**. API TheMealDB yang digunakan FlavorDash bersifat stateless. JWT melengkapi paradigma ini karena setiap request bersifat independen (self-contained).

4. **Kemudahan implementasi di React Native**. Dengan AsyncStorage sebagai persistent storage di device, JWT token bisa disimpan dan dibaca dengan sangat mudah tanpa perlu mekanisme cookie yang kompleks.

**Implementasi di FlavorDash:**
```tsx
// contexts/AuthContext.tsx
// Login: Simpan JWT token ke AsyncStorage
await AsyncStorage.setItem("@flavordash_jwt_token", token);

// (protected)/_layout.tsx — Middleware
// Check: Apakah JWT token ada?
const { isAuthenticated } = useAuth();
if (!isAuthenticated) {
  router.replace("/login"); // Redirect ke login jika tidak ada token
}
```

---

## 🔐 Akun Demo (reqres.in)

| Field | Value |
|-------|-------|
| **Email** | `eve.holt@reqres.in` |
| **Password** | `cityslicka` |

> **Catatan**: Aplikasi menggunakan reqres.in sebagai mock API backend. Ini adalah layanan gratis yang menyediakan endpoint login yang mengembalikan JWT token untuk keperluan testing.

---

## 📄 Lisensi

Proyek ini dikembangkan untuk **UAS Pemrograman Mobile** — Pak Sandy.
