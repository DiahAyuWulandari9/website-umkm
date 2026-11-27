const DATA_URL = "data/products.json";
const catalogStatus = document.querySelector("#catalog-status");
const produkGrid = document.querySelector("#produk-dinamis");
const produkRingkasan = document.querySelector("#produk-ringkasan");
const produkUnggulan = document.querySelector("#produk-unggulan");
const tombolFilter = document.querySelectorAll("[data-filter]");

// state katalog: data hasil fetch
let products = [];

// helper status: mengatur kelas (loading / success / error) dan pesan katalog
function setStatus(state, message) {
    catalogStatus.className = "catalog-status";
    if (state) {
        catalogStatus.classList.add(state);
    }
    catalogStatus.textContent = message;
}

// mengambil data produk dari file JSON
async function loadProducts() {
    try {
        setStatus("loading", "Memuat data produk...");

        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("format JSON harus Array of Objects");
        }

        products = data;
        renderFeatured(products);
        renderProducts(products); // renderProducts juga mengatur status success / empty
    } catch (error) {
        products = [];
        produkGrid.replaceChildren();
        produkRingkasan.textContent = "Data produk tidak dapat ditampilkan";
        produkUnggulan.textContent = "Produk unggulan tidak tersedia";
        setStatus("error", `Gagal memuat produk: ${error.message}`);
    }
}

// menampilkan kartu produk (atau empty state) dan status yang sesuai
function renderProducts(items) {
    produkGrid.replaceChildren();

    if (items.length === 0) {
        produkGrid.append(createEmptyState());
        produkRingkasan.textContent = "0 produk ditemukan";
        setStatus("success", "Request berhasil, tetapi data kosong");
        return;
    }

    items.forEach((product) => {
        produkGrid.append(createProductCard(product));
    });

    produkRingkasan.textContent = `${items.length} produk ditampilkan`;
    setStatus("success", `${products.length} produk berhasil dimuat`);
}

// menampilkan nama produk unggulan (featured: true) dari data hasil fetch
function renderFeatured(items) {
    const names = items.filter((item) => item.featured).map((item) => item.name);
    produkUnggulan.textContent = names.length > 0
        ? `Produk unggulan: ${names.join(", ")}`
        : "Belum ada produk unggulan";
}

// filter kategori memakai data hasil fetch
function applyFilter(category) {
    const filtered = category === "Semua"
        ? products
        : products.filter((product) => product.category === category);

    renderProducts(filtered);
}

tombolFilter.forEach((button) => {
    button.addEventListener("click", (event) => {
        tombolFilter.forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
        });

        event.currentTarget.classList.add("is-active");
        event.currentTarget.setAttribute("aria-pressed", "true");

        applyFilter(event.currentTarget.dataset.filter ?? "Semua");
    });
});

// tampilan ketika data kosong
function createEmptyState() {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "Belum ada produk yang tersedia";

    return emptyMessage;
}

// kartu produk (class memakai style yang sudah ada di style.css)
function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "js-product-card";

    if (product.featured) {
        const badge = document.createElement("span");
        badge.className = "best-seller-badge";
        badge.textContent = "★ BEST SELLER";
        card.append(badge);
    }

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const category = document.createElement("p");
    category.className = "category-note";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(product.price);

    const stock = document.createElement("p");
    stock.className = "stock-badge " + (
        product.stock <= 0 ? "empty" : product.stock <= 5 ? "warning" : "available"
    );
    stock.textContent = product.stock > 0
        ? `Stok: ${product.stock}`
        : "Stok habis";

    card.append(title, description, category, price, stock);
    return card;
}

loadProducts();