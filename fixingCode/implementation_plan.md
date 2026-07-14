# 🍽️ FlavorDash — Planning Lanjutan UAS Pemrograman Mobile

## Latar Belakang

Proyek **FlavorDash** saat ini adalah aplikasi React Native (Expo SDK 54) sederhana yang hanya menampilkan **1 screen**: [FoodDetailScreen.tsx](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/screens/FoodDetailScreen.tsx). Aplikasi menggunakan TheMealDB API untuk fetch detail makanan dan sudah mengimplementasikan AsyncStorage untuk favorit dan riwayat terakhir dilihat. Tidak ada navigasi, tidak ada login, tidak ada kamera, dan tidak ada maps.

Untuk UAS Pak Sandy, ada **5 requirement utama** yang harus dipenuhi. Berikut analisis gap antara kondisi saat ini vs kebutuhan UAS:

---

## 📊 Gap Analysis: Kondisi Saat Ini vs Kebutuhan UAS

| # | Requirement UAS | Status Saat Ini | Gap |
|---|----------------|-----------------|-----|
| 1 | **Katalog Makanan** — Halaman katalog dengan `<View>`, `<Text>`, `<Image>`, Flexbox layout row, data dari API | ❌ **Tidak ada** — Hanya ada halaman detail, tidak ada katalog/list | **Buat dari nol** |
| 2 | **Detail Pesanan** — Protected route, hanya bisa diakses user yg sudah login, JWT + Middleware Expo Router | ⚠️ **Parsial** — FoodDetailScreen ada tapi: (a) tidak pakai Expo Router, (b) tidak ada auth/JWT, (c) tidak ada proteksi route | **Migrasi ke Expo Router + tambah auth** |
| 3 | **Fitur Camera** — Ambil foto bukti penerimaan pesanan + tampilkan hasilnya | ❌ **Tidak ada** | **Buat dari nol** |
| 4 | **Fitur Maps** — Halaman peta lokasi restoran/tujuan + minimal 1 marker | ❌ **Tidak ada** | **Buat dari nol** |
| 5 | **Analisis Tertulis** — (a) Alasan Flexbox + ukuran proporsional, (b) Perbedaan Stateful vs Stateless Auth (JWT) | ❌ **Tidak ada** | **Tulis di README** |

> [!WARNING]
> **Perubahan Arsitektur Besar**: Saat ini app pakai `registerRootComponent(App)` biasa (single screen). Untuk memenuhi requirement JWT Middleware + multiple screen, app **wajib migrasi ke Expo Router** (file-based routing). Ini adalah perubahan paling fundamental.

---

## 📋 Detail Setiap Requirement UAS

### 1️⃣ Katalog Makanan (Halaman Baru)

**Perintah Dosen:**
- Buat halaman katalog menggunakan `<View>`, `<Text>`, dan `<Image>`
- Terapkan **Flexbox** agar gambar dan info produk tersusun rapi dalam satu baris (row layout)
- Data dari **Mock API atau Custom API**

**Yang Perlu Dikerjakan:**
- Buat screen `CatalogScreen` yang menampilkan grid/list makanan
- Gunakan TheMealDB search/filter API (sudah tersedia gratis) atau buat mock data
- Layout: Setiap item makanan tampil dalam **satu baris (row)** → gambar di kiri, info di kanan → menggunakan `flexDirection: "row"`
- Screen ini jadi **halaman utama (home)** setelah login

**Endpoint API yang bisa dipakai:**
- `https://www.themealdb.com/api/json/v1/1/search.php?s=` — search by name
- `https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood` — filter by category
- `https://www.themealdb.com/api/json/v1/1/categories.php` — list categories

---

### 2️⃣ Detail Pesanan + JWT Auth + Expo Router Middleware

**Perintah Dosen:**
- Halaman Detail Pesanan **hanya bisa diakses user yang sudah login**
- Implementasi **JWT (JSON Web Token)** untuk autentikasi
- Gunakan **Middleware pada Expo Router** untuk proteksi halaman

**Yang Perlu Dikerjakan:**

#### A. Migrasi ke Expo Router
- Ubah struktur project dari `App.tsx` + `registerRootComponent` → ke **Expo Router file-based routing** (`app/` directory)
- Struktur folder baru:
  ```
  app/
  ├── _layout.tsx          # Root layout (AuthProvider wrapper)
  ├── index.tsx            # Redirect ke login/catalog
  ├── login.tsx            # Halaman Login
  ├── (protected)/
  │   ├── _layout.tsx      # Protected layout (middleware JWT check)
  │   ├── catalog.tsx      # Katalog Makanan
  │   ├── detail/[id].tsx  # Detail Pesanan (dynamic route)
  │   ├── camera.tsx       # Fitur Camera
  │   └── maps.tsx         # Fitur Maps
  ```

#### B. Implementasi JWT Authentication
- Buat **mock auth backend** (bisa pakai JSON file atau mock API endpoint)
- Flow: Login → dapat JWT token → simpan token di AsyncStorage → setiap akses protected route, check token
- Buat `AuthContext` untuk state management auth (login, logout, token)
- JWT token bisa di-generate secara **client-side mock** (untuk demo) atau pakai mock API

#### C. Expo Router Middleware
- Di `app/(protected)/_layout.tsx`, implementasi **middleware/guard**:
  - Check apakah JWT token ada di AsyncStorage
  - Kalau tidak ada → redirect ke `/login`
  - Kalau ada → render children (protected screens)

> [!IMPORTANT]
> **Pilihan Mock Backend JWT:**
> Karena ini tugas UAS yang fokusnya di mobile (bukan backend), kita bisa pakai pendekatan **client-side mock JWT** — generate token dummy saat login berhasil, simpan di AsyncStorage, dan validasi keberadaannya. Ini sudah cukup untuk mendemonstrasikan konsep JWT + Middleware ke dosen. Alternatifnya, bisa pakai https://reqres.in/ sebagai mock API login yang return token.

---

### 3️⃣ Fitur Camera

**Perintah Dosen:**
- Tambahkan fitur kamera untuk **mengambil foto sebagai bukti penerimaan pesanan**
- **Tampilkan hasil foto** setelah berhasil diambil

**Yang Perlu Dikerjakan:**
- Install `expo-camera` dan `expo-image-picker`
- Buat screen `CameraScreen` dengan flow:
  1. User tekan tombol "Ambil Foto Bukti"
  2. Kamera terbuka
  3. User ambil foto
  4. Preview foto ditampilkan di layar
  5. Bisa simpan/retake
- Package: `expo-camera` atau `expo-image-picker` (lebih simpel, pakai `launchCameraAsync`)

---

### 4️⃣ Fitur Maps

**Perintah Dosen:**
- Halaman yang menampilkan **lokasi restoran atau lokasi tujuan** menggunakan peta
- Tampilkan **minimal 1 marker** pada peta

**Yang Perlu Dikerjakan:**
- Install `react-native-maps`
- Buat screen `MapsScreen`:
  - Tampilkan peta (MapView) dengan region default (misal: lokasi Jakarta/kota kamu)
  - Tambahkan **marker** untuk menandai lokasi restoran
  - Bisa tambahkan beberapa marker dummy untuk restoran-restoran berbeda
- Opsional: Tampilkan lokasi user saat ini (GPS) + marker restoran terdekat

---

### 5️⃣ Analisis Tertulis (README)

**Perintah Dosen:**
1. Jelaskan alasan penggunaan Flexbox dan ukuran proporsional (flex/persentase) dalam tampilan responsif
2. Jelaskan perbedaan **Stateful Authentication vs Stateless Authentication (JWT)**, serta alasan pemilihan JWT pada aplikasi mobile

**Yang Perlu Dikerjakan:**
- Tulis bagian **"Analisis"** di README.md yang menjelaskan kedua topik di atas
- Sertakan contoh kode dari project sendiri sebagai bukti implementasi

---

## 🏗️ Proposed Changes — Rencana Implementasi

### Fase 0: Migrasi Arsitektur ke Expo Router

> Ini **wajib dilakukan pertama** karena semua fitur lain bergantung pada routing.

#### [MODIFY] [package.json](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/package.json)
- Tambah dependencies baru:
  - `expo-router` — file-based routing
  - `expo-linking` — deep linking (dependency expo-router)
  - `expo-constants` — required by expo-router
  - `react-native-safe-area-context` — safe area support
  - `react-native-screens` — native screen optimization
  - `react-native-maps` — fitur maps
  - `expo-image-picker` — fitur camera (lebih simpel dari expo-camera)
  - `expo-location` — opsional untuk GPS
  - `jwt-decode` — decode JWT token (optional)

#### [MODIFY] [app.json](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/app.json)
- Tambah `"scheme": "flavordash"` untuk deep linking
- Update entry point untuk expo-router

#### [DELETE] [index.ts](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/index.ts)
- Tidak diperlukan lagi, Expo Router handle entry point sendiri

#### [DELETE] [App.tsx](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/App.tsx)
- Tidak diperlukan lagi, diganti oleh `app/_layout.tsx`

---

### Fase 1: Authentication System (JWT)

#### [NEW] `app/_layout.tsx`
- Root layout: bungkus seluruh app dengan `AuthProvider`
- Setup navigation container

#### [NEW] `contexts/AuthContext.tsx`
- React Context untuk auth state
- Functions: `login(email, password)`, `logout()`, `isAuthenticated`
- Simpan JWT token di AsyncStorage
- Mock JWT generation (atau call ke reqres.in)

#### [NEW] `app/login.tsx`
- Halaman login dengan form email + password
- Design premium dark mode sesuai theme FlavorDash
- Validasi input + loading state
- Setelah login sukses → redirect ke catalog

---

### Fase 2: Katalog Makanan

#### [NEW] `app/(protected)/_layout.tsx`
- **Middleware/Guard**: Check JWT token di AsyncStorage
- Jika belum login → `router.replace("/login")`
- Jika sudah login → render child screens (Tab Navigator atau Stack)

#### [NEW] `app/(protected)/catalog.tsx`
- Halaman utama katalog makanan
- Fetch data dari TheMealDB API (search/categories)
- Layout: FlatList/ScrollView dengan item = **row layout** (gambar kiri, info kanan)
- Menggunakan `<View>`, `<Text>`, `<Image>` sesuai requirement
- Flexbox `flexDirection: "row"` untuk setiap card item
- Bisa tap item → navigasi ke detail

#### [MODIFY] `screens/FoodDetailScreen.tsx` → [NEW] `app/(protected)/detail/[id].tsx`
- Migrasi dari props-based ke route-params-based
- Gunakan `useLocalSearchParams()` dari expo-router untuk ambil `id`
- Pertahankan semua fitur existing (favorit, riwayat, dsb)

---

### Fase 3: Fitur Camera

#### [NEW] `app/(protected)/camera.tsx`
- Halaman bukti penerimaan pesanan
- Tombol "Ambil Foto Bukti Penerimaan"
- Pakai `expo-image-picker` → `launchCameraAsync()`
- Preview foto setelah diambil
- Bisa retake / konfirmasi

---

### Fase 4: Fitur Maps

#### [NEW] `app/(protected)/maps.tsx`
- Halaman lokasi restoran
- `react-native-maps` MapView
- Minimal 1 marker (lokasi restoran)
- Bisa tambah beberapa marker dummy
- Style peta dark mode (sesuai tema app)

---

### Fase 5: Analisis + README

#### [MODIFY] [README.md](file:///C:/codingVibes/kuliah/mk-pemogramanMobile/FlavorDash/README.md)
- Update fitur-fitur baru
- Tambah section **"Analisis"**:
  1. Analisis Flexbox & Responsivitas
  2. Analisis Stateful vs Stateless Auth (JWT)
- Update cara menjalankan aplikasi
- Update struktur folder

---

## 📁 Struktur Folder Akhir (Setelah Upgrade)

```
FlavorDash/
├── .env                           # API endpoints
├── app.json                       # Expo config (+ scheme)
├── package.json                   # Dependencies updated
├── tsconfig.json                  # TypeScript config
├── assets/                        # Icons, splash, etc.
├── contexts/
│   └── AuthContext.tsx             # [NEW] JWT Auth Context
├── app/
│   ├── _layout.tsx                # [NEW] Root Layout (AuthProvider)
│   ├── index.tsx                  # [NEW] Entry redirect
│   ├── login.tsx                  # [NEW] Login Screen
│   └── (protected)/
│       ├── _layout.tsx            # [NEW] Auth Middleware Guard
│       ├── catalog.tsx            # [NEW] Katalog Makanan
│       ├── detail/
│       │   └── [id].tsx           # [MIGRATED] Detail Pesanan
│       ├── camera.tsx             # [NEW] Fitur Camera
│       └── maps.tsx               # [NEW] Fitur Maps
├── screens/                       # Legacy (bisa dihapus setelah migrasi)
└── README.md                      # Updated + Analisis
```

---

## ⚠️ Open Questions — Perlu Diskusi

> [!IMPORTANT]
> **1. Mock Backend atau Real Backend untuk JWT?**
> - **Opsi A (Recommended)**: Pakai **reqres.in** sebagai mock API login (POST `https://reqres.in/api/login`) → return token. Simpel, tidak perlu setup server.
> - **Opsi B**: Buat mock JWT **client-side** (generate token dummy). Lebih cepat tapi kurang realistis.
> - **Opsi C**: Buat backend sendiri (Node.js + Express). Paling lengkap tapi butuh effort lebih.
>
> Mana yang mau dipakai?

> [!IMPORTANT]
> **2. Navigasi antar screen: Tab Navigator atau Stack Navigator?**
> - **Opsi A (Recommended)**: **Tab Navigator** di bottom — ada tab: Katalog, Maps, Camera, Profile/Logout. Detail pesanan tetap Stack (push dari catalog).
> - **Opsi B**: **Stack Navigator** saja — semua screen linear, navigasi pakai tombol.
>
> Mana yang lebih cocok?

> [!IMPORTANT]
> **3. Maps: Lokasi mana yang mau ditampilkan?**
> - Perlu tahu kota/koordinat default yang mau ditampilkan di peta (misal: Jakarta, Bandung, dll?)
> - Atau pakai lokasi GPS user saat ini?

> [!IMPORTANT]
> **4. Expo SDK Version**
> - Saat ini pakai **Expo SDK 54**. Expo Router v4 support SDK 52+, jadi seharusnya kompatibel.
> - Apakah mau tetap di SDK 54 atau upgrade?

---

## ✅ Verification Plan

### Automated Tests
```bash
# 1. Pastikan dependencies terinstall tanpa error
npm install

# 2. Pastikan TypeScript tidak ada error
npx tsc --noEmit

# 3. Jalankan aplikasi
npx expo start
```

### Manual Verification
1. **Auth Flow**: Login → dapat token → masuk catalog → logout → redirect ke login
2. **Katalog**: Data makanan tampil dalam layout row, responsif di berbagai ukuran layar
3. **Protected Route**: Akses langsung ke `/detail/xxx` tanpa login → redirect ke login
4. **Camera**: Buka kamera → ambil foto → preview muncul
5. **Maps**: Peta tampil → marker terlihat → bisa zoom/pan
6. **README**: Analisis tertulis lengkap dan akurat

---

## 📦 Estimasi Dependencies Baru

| Package | Fungsi | Size Impact |
|---------|--------|-------------|
| `expo-router` | File-based routing | Core |
| `expo-linking` | Deep linking (req. by router) | Small |
| `expo-constants` | App constants (req. by router) | Small |
| `react-native-safe-area-context` | Safe area | Small |
| `react-native-screens` | Native screens | Small |
| `react-native-maps` | MapView + Markers | Medium |
| `expo-image-picker` | Camera/gallery access | Small |
| `expo-location` | GPS location (opsional) | Small |
