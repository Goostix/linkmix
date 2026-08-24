# Linkmix

Platform link-in-bio yang playful dan mudah dikustomisasi untuk mengelola tautan, profil media sosial, dan konten personal tanpa perlu coding.

Repository ini berisi source aplikasi Linkmix yang sudah disanitasi. Data profil, daftar link, foto, background, email pemilik, isi database, endpoint produksi, dan credential tidak disertakan.

## Struktur

- `editor/` — dashboard untuk mengedit profil, social links, announcement, link cards, catatan, warna, dan footer.
- `public-page/` — halaman link-in-bio publik yang membaca data dari API editor.

## Format konten

Link card:

```text
kategori | symbol/emoji #hexcolor | title | short desc | link
```

Social link:

```text
social media | text | link
```

Catatan opsional:

```text
judul | isi catatan
```

## Menjalankan editor

Editor menggunakan Vinext, Cloudflare D1, dan Sign in with ChatGPT pada ChatGPT Sites.

1. Buat project Sites baru dan hubungkan source di folder `editor/`.
2. Ganti nilai placeholder di `editor/.openai/hosting.json` dengan project ID milikmu.
3. Pastikan binding D1 bernama `DB` dan jalankan migration di folder `editor/drizzle/`.
4. Atur `PUBLIC_PAGE_ORIGINS` menggunakan domain halaman publik. Beberapa domain dapat dipisahkan dengan koma.
5. Jalankan `npm ci`, lalu `npm run dev` untuk development atau `npm run build` untuk production build.

## Menjalankan halaman publik

Folder `public-page/` dapat dideploy sebagai project Vercel terpisah.

1. Atur environment variable `LINKMIX_DATA_URL` ke endpoint `/api/links` milik editor.
2. Sebagai alternatif untuk hosting statis, isi `apiUrl` di `public-page/config.js`.
3. Deploy folder `public-page/` ke Vercel.

## Data dan keamanan

- Jangan commit file `.env`, token, credential, atau export database.
- Ganti semua placeholder domain sebelum digunakan di production.
- Data pengguna tersimpan di D1 milik project masing-masing, bukan di repository.
- Write action editor memerlukan user yang sudah login.

## Teknologi

- Next.js compatible UI melalui Vinext
- Cloudflare Workers dan D1
- Drizzle ORM
- Vercel Functions untuk halaman publik
- Plus Jakarta Sans dan desain neo-brutalism
