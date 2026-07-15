# FlavorDash

## Penjelasan
FlavorDash adalah aplikasi food delivery dan resep masakan berbasis mobile yang memungkinkan pengguna menjelajahi katalog makanan, mengunggah foto bukti pesanan, dan melacak lokasi restoran secara real-time. Aplikasi ini dirancang menggunakan antarmuka modern yang responsif dan dilindungi dengan sistem autentikasi stateless (JWT) untuk keamanan sesi pengguna.

## Stack / Teknis
- **Bahasa Pemrograman**: TypeScript (React Native dengan framework Expo)
- **AI Recommendation**: Tidak menggunakan AI / OpenAI (data bersumber langsung dari TheMealDB API)
- **Database (API)**: 
  - TheMealDB API (untuk data katalog makanan dan resep)
  - reqres.in API (Mock API untuk simulasi autentikasi JWT)

## Flow Aplikasi
1. **Otorisasi (Login)**: Saat aplikasi dibuka, sistem akan mengecek ketersediaan JWT token. Jika tidak ada sesi aktif, pengguna diwajibkan untuk login terlebih dahulu.
2. **Eksplorasi Katalog**: Setelah login, pengguna diarahkan ke halaman utama yang menampilkan daftar makanan dalam bentuk *row layout* yang dapat di-filter dan dicari.
3. **Detail Resep**: Pengguna dapat menekan salah satu makanan untuk masuk ke halaman detail yang menampilkan informasi bahan dan instruksi memasak lengkap.
4. **Bukti Penerimaan & Lokasi**: Terdapat menu navigasi bawah untuk mengakses fitur Kamera (mengambil foto bukti pesanan diterima) dan fitur Maps (melihat posisi restoran terdekat berdasarkan GPS pengguna).
5. **Manajemen Akun**: Pada halaman Profil, pengguna dapat melihat status sesi aktif mereka dan melakukan *Logout* untuk menghapus token akses dari penyimpanan lokal.

---

## Analisis Arsitektur

### A. Alasan Penggunaan Flexbox dan Ukuran Proporsional untuk Responsivitas

**Flexbox (Flexible Box Layout)** adalah sistem layout utama di React Native yang memungkinkan penyusunan elemen UI secara fleksibel dan adaptif tanpa harus menentukan posisi pixel secara absolut. Dalam FlavorDash, Flexbox digunakan secara menyeluruh karena beberapa alasan:

1. **Adaptasi Otomatis terhadap Ukuran Layar**:
   Dengan menggunakan properti `flex: 1` pada container dan `flexDirection: "row"` pada card makanan, layout aplikasi secara otomatis menyesuaikan proporsinya di berbagai ukuran layar Android. Tidak perlu menghitung lebar pixel secara manual untuk setiap model HP.
2. **Ukuran Proporsional (Persentase & aspectRatio)**:
   Alih-alih menggunakan ukuran fix pixel, aplikasi memanfaatkan kombinasi `width: "100%"`, persentase (`30%`), dan `aspectRatio` untuk menjaga proporsi gambar dan komponen UI agar tetap skalabel di berbagai orientasi layar.
3. **Konsistensi Cross-Platform**:
   Flexbox di React Native berperilaku konsisten, sehingga UI akan ter-render secara proporsional baik pada layar kecil maupun tablet.

### B. Perbedaan Stateful Authentication vs Stateless Authentication (JWT)

**Stateful Authentication** adalah mekanisme di mana **server menyimpan status sesi pengguna** di memori atau database server.
- **Cara Kerja**: Server membuat Session ID unik, menyimpannya di sisi server, dan mengirimkannya ke client. Setiap request dari client divalidasi dengan mencocokkan Session ID ke database server.
- **Kekurangan pada Mobile**: Tidak efisien untuk koneksi seluler yang tidak stabil karena server harus secara aktif mengelola memori/storage untuk ribuan sesi pengguna aktif, sehingga kurang *scalable*.

**Stateless Authentication (JWT — JSON Web Token)** adalah mekanisme di mana **server TIDAK menyimpan status sesi sama sekali**.
- **Cara Kerja**: Server memvalidasi login dan men-generate JWT (berisi payload data & signature kriptografi) untuk diberikan ke client. Client (aplikasi mobile) menyimpan token ini secara lokal (menggunakan AsyncStorage).
- **Alasan Pemilihan JWT pada FlavorDash**: Sangat ideal untuk aplikasi mobile karena token disimpan secara lokal, membebaskan beban database server dari penyimpanan sesi, sangat *scalable*, dan sejalan dengan prinsip arsitektur RESTful API yang bersifat independen. Setiap API request cukup membawa token di *header* untuk divalidasi melalui signature-nya.


4. Login credentials:
Email: eve.holt@reqres.in
Password: cityslicka