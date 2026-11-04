"use strict";

// P09: memastikan JavaScript aktif
console.log("P09 JavaScript aktif");

// Data produk NOURA Bites
const daftarProduk = [
    { nama: "Chocolate Almond", kategori: "Almond", harga: 15000, stok: 12, unggulan: true },
    { nama: "Coconut Choco", kategori: "Coconut", harga: 15000, stok: 8, unggulan: false },
    { nama: "Smart Snack Mix", kategori: "Mix", harga: 20000, stok: 10, unggulan: true },
    { nama: "Almond Crunch", kategori: "Almond", harga: 17000, stok: 5, unggulan: false },
    { nama: "Coconut Choco Bites", kategori: "Choco", harga: 17000, stok: 0, unggulan: false }
];

console.table(daftarProduk);

// Mengubah angka menjadi format Rupiah
function formatRupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(nilai);
}

// Menentukan status berdasarkan jumlah stok
function statusStok(stok) {
    if (stok <= 0) {
        return { label: "Stok habis", className: "empty" };
    }

    if (stok <= 5) {
        return { label: "Stok terbatas", className: "warning" };
    }

    return { label: "Stok tersedia", className: "available" };
}

// Membuat satu kartu produk dalam bentuk HTML
function buatKartuProduk(produk) {
    const status = statusStok(produk.stok);

    return `
        <article class="js-product-card">
            ${produk.unggulan ? `
                <span class="best-seller-badge">★ BEST SELLER</span>
            ` : ""}
            <h3>${produk.nama}</h3>
            <p class="category-note">${produk.kategori}</p>
            <p class="price">${formatRupiah(produk.harga)}</p>
            <span class="stock-badge ${status.className}">${status.label}</span>
            <a
                href="${produk.stok > 0 ? "kontak.html" : "#"}"
                class="product-action${produk.stok <= 0 ? " is-disabled" : ""}"
                ${produk.stok <= 0 ? 'aria-disabled="true" tabindex="-1"' : ""}
                aria-label="${produk.stok > 0 ? `Pesan ${produk.nama}` : `Stok ${produk.nama} habis`}"
            >
                ${produk.stok > 0 ? "🛒 Siap dipesan" : "Stok habis"}
            </a>
        </article>
    `;
}

// Menampilkan data produk ke halaman
function renderProduk() {
    const grid = document.querySelector("#produk-dinamis");
    const ringkasan = document.querySelector("#produk-ringkasan");
    const unggulan = document.querySelector("#produk-unggulan");

    // Hentikan proses jika elemen HTML yang dibutuhkan tidak ditemukan
    if (!grid || !ringkasan || !unggulan) {
        console.error("Target render produk belum lengkap.");
        return;
    }

    // Mengolah data produk
    const produkTersedia = daftarProduk.filter((produk) => produk.stok > 0);
    const produkUnggulan = daftarProduk.find((produk) => produk.unggulan === true);
    const markupProduk = produkTersedia.map(buatKartuProduk).join("");

    // Menampilkan hasil ke halaman
    grid.innerHTML = markupProduk;
    ringkasan.textContent =
        `${produkTersedia.length} produk tersedia dari ${daftarProduk.length} produk`;

    unggulan.textContent = produkUnggulan
        ? `Produk unggulan: ${produkUnggulan.nama}`
        : "Tidak ada produk unggulan saat ini";

    // Debugging data
    daftarProduk.forEach((produk) => {
        console.log("Debug produk:", produk.nama, "stok:", produk.stok);
    });

    console.table(produkTersedia);
}

// Jalankan setelah struktur HTML selesai dimuat
document.addEventListener("DOMContentLoaded", renderProduk);