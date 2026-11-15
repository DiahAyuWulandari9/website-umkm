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

// ==================================================
// P11 - DOM, EVENTS, DAN RENDERING
// ==================================================

// 1) DOM selection: ambil elemen target sekali di awal.
const produkGrid = document.querySelector("#produk-grid");        // wadah kartu produk
const produkStatus = document.querySelector("#produk-status");    // teks jumlah produk
const unggulan = document.querySelector("#produk-unggulan");      // teks produk unggulan
const tombolFilter = document.querySelectorAll("[data-filter]");  // semua tombol filter

console.log("Target DOM:", { produkGrid, produkStatus, unggulan, tombolFilter });

// 2) Function pembuat empty state (hanya membuat elemen, belum menempelkan ke halaman)
function buatEmptyState(kategori) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = `Belum ada produk pada kategori ${kategori}`;
    return empty;
}

// 3) Function pembuat kartu produk: input 1 object produk -> output 1 elemen <article>
function buatElemenProduk(produk) {
    const card = document.createElement("article");
    card.classList.add("js-product-card");

    // Badge BEST SELLER hanya untuk produk unggulan
    if (produk.unggulan) {
        const badge = document.createElement("span");
        badge.classList.add("best-seller-badge");
        badge.textContent = "★ BEST SELLER";
        card.append(badge);
    }

    const title = document.createElement("h3");
    title.textContent = produk.nama;              // textContent: teks aman, bukan HTML

    const category = document.createElement("p");
    category.classList.add("category-note");
    category.textContent = produk.kategori;

    const price = document.createElement("p");
    price.classList.add("price");
    price.textContent = formatRupiah(produk.harga);

    const stock = document.createElement("span");
    const status = statusStok(produk.stok);       // pakai function dari P10
    stock.classList.add("stock-badge");
    if (status.className) {
        stock.classList.add(status.className);    // available / warning / empty
    }
    stock.textContent = status.label;

    const aksi = document.createElement("a");
    aksi.classList.add("product-action");
    if (produk.stok > 0) {
        aksi.href = "kontak.html";
        aksi.textContent = "Pesan Sekarang";
    } else {
        aksi.href = "#";
        aksi.textContent = "Stok Habis";
        aksi.classList.add("is-disabled");
        aksi.setAttribute("aria-disabled", "true");
        aksi.setAttribute("tabindex", "-1");
    }

    // Latihan remove(): tombol untuk menyembunyikan kartu dari tampilan saat ini
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Sembunyikan";
    removeButton.classList.add("ghost-button");

    removeButton.addEventListener("click", () => {
        card.remove();   // hanya menghapus elemen dari DOM, array daftarProduk tidak berubah
        produkStatus.textContent = "Satu kartu disembunyikan dari tampilan sementara";
        console.log("Kartu dihapus dari DOM:", produk.nama,
                    "| jumlah data di array:", daftarProduk.length);
    });

    card.append(title, category, price, stock, aksi, removeButton);
    return card;
}

// 4) Function render: filter data -> kosongkan grid -> buat kartu -> tempel ke grid
function renderProduk(kategoriAktif = "Semua") {
    // Guard: hentikan jika target tidak ditemukan
    if (!produkGrid || !produkStatus) {
        console.warn("Target render produk tidak ditemukan.");
        return;
    }

    console.log("Render kategori:", kategoriAktif);

    // Filter data: "Semua" = semua produk, selain itu saring berdasarkan kategori
    const produkTampil = kategoriAktif === "Semua"
        ? daftarProduk
        : daftarProduk.filter((produk) => produk.kategori === kategoriAktif);

    // Teks produk unggulan: produk unggulan pertama yang stoknya masih ada
    if (unggulan) {
        const produkUnggulan = daftarProduk.find((produk) => produk.unggulan && produk.stok > 0);
        unggulan.textContent = produkUnggulan
            ? `Produk unggulan: ${produkUnggulan.nama}`
            : "Tidak ada produk unggulan saat ini";
    }

    // replaceChildren() tanpa argumen = kosongkan grid agar kartu tidak dobel
    produkGrid.replaceChildren();

    // Empty state bila hasil filter kosong
    if (produkTampil.length === 0) {
        produkGrid.append(buatEmptyState(kategoriAktif));
        produkStatus.textContent = "0 produk ditemukan";
        console.table(produkTampil);
        return;
    }

    produkTampil.forEach((produk) => {
        produkGrid.append(buatElemenProduk(produk));
    });

    produkStatus.textContent = `${produkTampil.length} produk ditampilkan`;
    console.table(produkTampil);
}

// 5) Event listener: satu listener per tombol filter
tombolFilter.forEach((tombol) => {
    tombol.addEventListener("click", (event) => {
        const tombolAktif = event.currentTarget;     // tombol yang menerima listener
        const kategori = tombolAktif.dataset.filter; // nilai data-filter

        // classList: pindahkan state aktif ke tombol yang diklik
        tombolFilter.forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
        });
        tombolAktif.classList.add("is-active");
        tombolAktif.setAttribute("aria-pressed", "true");

        renderProduk(kategori);
    });
});

// 6) Render awal
renderProduk();