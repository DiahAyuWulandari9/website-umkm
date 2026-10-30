// Tombol promo bagian atas
const promoButton = document.getElementById("promoButton");

// Jalankan fungsi promo ketika tombolnya tersedia
if (promoButton) {
    promoButton.addEventListener("click", function () {
        alert("Yuk, cek promo NOURA Bites hari ini!");
        console.log("Tombol promo NOURA Bites diklik");
    });
}

// Hamburger menu
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");

if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
        const isOpen =
            navToggle.getAttribute("aria-expanded") === "true";

        navToggle.setAttribute("aria-expanded", String(!isOpen));
        navToggle.setAttribute(
            "aria-label",
            isOpen ? "Buka menu navigasi" : "Tutup menu navigasi"
        );

        navMenu.classList.toggle("is-open", !isOpen);
    });
}