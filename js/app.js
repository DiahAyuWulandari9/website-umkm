"use strict";

// P09 - JavaScript Fundamental dan Data
console.log("P09 JavaScript aktif");

// 1. Data produk NOURA Bites (array of object)
const daftarProduk = [
    { nama: "Chocolate Almond", kategori: "Almond", harga: 15000, stok: 12, unggulan: true},
    { nama: "Coconut Choco", kategori: "Coconut", harga: 15000, stok: 8, unggulan: false},
    { nama: "Smart Snack Mix", kategori: "Mix", harga: 20000, stok: 10, unggulan: true},
    { nama: "Almond Crunch", kategori: "Almond", harga: 17000, stok: 5, unggulan: false},
    { nama: "Coconut Choco Bites", kategori: "Choco", harga: 17000, stok: 0, unggulan: false}
];

console.table(daftarProduk);

// 2. Formatter harga ke rupiah
const formatRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
});

console.log(formatRupiah.format(daftarProduk[0].harga));

// 3. Conditional status stok
function statusStok(stok) {
    if (stok === 0) {
        return { label: "Stok habis", className: "empty" };
    } if (stok <= 5) {
        return { label: "Stok terbatas", className: "warning" };
    } return { label: "Stok tersedia", className: "" };
}

// 4. Conditional kategori
function labelKategori(kategori) {
    switch (kategori) {
        case "Almond":
            return "Varian Almond";
        case "Coconut":
            return "Varian Coconut";
        case "Mix":
            return "Varian Mix";
        case "Choco":
            return "Varian Cokelat";
        default:
            return "Produk NOURA Bites";
    }
}

// 5. Render data produk ke halaman Produk
function renderProduk() {
    const grid = document.querySelector("#produk-dinamis");
    const ringkasan = document.querySelector("#produk-ringkasan");

    if (!grid || !ringkasan) {
        return;
    }

    grid.replaceChildren();

    for (const produk of daftarProduk) {
        const status = statusStok(produk.stok);
        const kategori = labelKategori(produk.kategori);

        const kartu = document.createElement("article");
        kartu.className = "js-product-card";

        // LABEL BEST SELLER MENEMPEL DI POJOK KARTU
        if (produk.unggulan) {
            const labelUnggulan = document.createElement("span");
            labelUnggulan.className = "best-seller-badge";
            labelUnggulan.textContent = "★ BEST SELLER";
            kartu.append(labelUnggulan);
        }

        // NAMA PRODUK
        const judul = document.createElement("h3");
        judul.textContent = produk.nama;

        // KATEGORI PRODUK
        const teksKategori = document.createElement("p");
        teksKategori.className = "product-category";
        teksKategori.textContent = kategori;

        // HARGA
        const harga = document.createElement("p");
        harga.className = "price";
        harga.textContent = formatRupiah.format(produk.harga);

        // STATUS STOK
        const badgeStok = document.createElement("span");
        badgeStok.className =
            `stock-badge ${status.className || "available"}`;
        badgeStok.textContent = status.label;

        // TOMBOL PEMESANAN
        const aksi = document.createElement("a");
        aksi.className = `product-action${produk.stok === 0 ? " is-disabled" : ""}`;

        aksi.textContent = produk.stok > 0
            ? "🛒  Siap dipesan"
            : "Stok habis";

        if (produk.stok > 0) {
            aksi.href = "kontak.html";
            aksi.setAttribute("aria-label", `Pesan ${produk.nama}`);
        } else {
            aksi.setAttribute("aria-disabled", "true");
            aksi.setAttribute("tabindex", "-1");
        }

        // MASUKKAN SEMUA ELEMEN KE KARTU
        kartu.append(judul, teksKategori, harga, badgeStok, aksi
        );

        grid.append(kartu);
    }

    ringkasan.textContent =
        `Menampilkan ${daftarProduk.length} produk NOURA Bites.`;
}

document.addEventListener("DOMContentLoaded", renderProduk);