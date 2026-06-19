# Langkah-langkah Push Project ke GitHub

Dokumen ini berisi panduan langkah demi langkah untuk mengunggah (push) project ini ke repository GitHub.

## Prasyarat
1. Pastikan Anda sudah menginstal [Git](https://git-scm.com/) di komputer Anda.
2. Anda sudah memiliki akun [GitHub](https://github.com/).

## Langkah 1: Buat Repository Baru di GitHub
1. Buka browser dan login ke akun GitHub Anda.
2. Klik tombol **New** atau tanda **+** di pojok kanan atas, lalu pilih **New repository**.
3. Beri nama repository Anda (misalnya `anjem-dashboard`).
4. Atur visibilitas menjadi **Public** atau **Private** sesuai kebutuhan.
5. **Jangan** centang opsi "Initialize this repository with a README", "Add .gitignore", atau "Add a license" karena kita akan mem-push project yang sudah ada.
6. Klik tombol **Create repository**.

## Langkah 2: Inisialisasi Git di Komputer Anda
Buka terminal (Command Prompt, PowerShell, atau terminal bawaan VS Code) dan pastikan Anda berada di direktori project ini.

Jika project ini belum pernah diinisialisasi dengan Git, jalankan perintah berikut:
```bash
git init
```

## Langkah 3: Menambahkan File ke Staging Area
Tambahkan semua file project ke dalam "staging area" agar Git tahu file apa saja yang akan disimpan.

```bash
git add .
```
*(Catatan: pastikan Anda memiliki file `.gitignore` yang tepat, misalnya untuk framework JavaScript agar folder seperti `node_modules/` tidak ikut ter-push).*

## Langkah 4: Membuat Commit
Simpan perubahan tersebut dengan membuat sebuah *commit*. Ganti `"Pesan commit"` dengan deskripsi yang sesuai (contoh: "Initial commit").

```bash
git commit -m "Initial commit"
```

## Langkah 5: Menghubungkan ke Repository GitHub (Remote)
Hubungkan folder project lokal Anda dengan repository yang baru saja dibuat di GitHub. Salin URL repository dari GitHub (biasanya berformat `https://github.com/username/nama-repo.git`).

Jalankan perintah ini:
```bash
git remote add origin https://github.com/xavyeerx/admin-anjem-dashboard
```
*(Ganti `<URL_REPOSITORY_ANDA>` dengan URL yang Anda salin dari GitHub).*

Untuk memastikan remote sudah tertambah, bisa dicek dengan:
```bash
git remote -v
```

## Langkah 6: Mengubah Branch Utama (Opsional tapi Disarankan)
GitHub sekarang menggunakan `main` sebagai default branch. Jika branch lokal Anda masih bernama `master`, ubah namanya menjadi `main` dengan perintah:

```bash
git branch -M main
```

## Langkah 7: Push Project ke GitHub
Terakhir, unggah (push) semua file dan commit ke GitHub dengan perintah:

```bash
git push -u origin main
```
Setelah berhasil, jika Anda me-refresh halaman repository di GitHub, file-file project Anda akan muncul di sana.

---

## Langkah-langkah Mengunggah Perubahan Baru (Update)
Setelah project berhasil dihubungkan ke GitHub (Langkah 1-7), Anda tidak perlu lagi melakukan inisialisasi (`git init`) atau menghubungkan remote repository. 

Selama masa pengembangan ke depannya, setiap kali Anda selesai melakukan perubahan pada kode dan ingin meng-update repository di GitHub, jalankan **3 perintah** ini secara berurutan di terminal:

1. **Simpan semua perubahan** ke dalam antrean (staging area):
   ```bash
   git add .
   ```
2. **Beri pesan/catatan** pada perubahan tersebut agar riwayatnya jelas:
   ```bash
   git commit -m "Pesan penjelasan perubahan"
   ```
   *(Contoh: `git commit -m "Memperbaiki bug pada halaman beranda"`)*
3. **Unggah (push)** ke GitHub:
   ```bash
   git push
   ```
