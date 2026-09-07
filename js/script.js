const promoButton = document.querySelection("#promoButton");

promoButton.addEventListener("click", () => {
    promoButton.textContent = "Promo: Beli 2 gratis tester!";
    console.log("Promo Roti DAW berhasil ditampilkan");
});