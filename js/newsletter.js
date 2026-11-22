"use strict";

(() => {
    const NEWSLETTER_KEY = "noura_bites_newsletter";

    const formNewsletter = document.querySelector("#form-newsletter");
    const btnHapus = document.querySelector("#btn-hapus-newsletter");
    const statusNewsletter = document.querySelector("#status-newsletter");

    if (!formNewsletter) return;

    const checkboxes = formNewsletter.querySelectorAll('input[name="newsletter"]');

    function tampilkanStatus(pesan, tipe) {
        statusNewsletter.textContent = pesan;
        statusNewsletter.className = `preference-status ${tipe}`;
    }

    function simpanNewsletter() {
        const dipilih = Array.from(checkboxes)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);

        if (dipilih.length === 0) {
            tampilkanStatus("Pilih minimal satu topik newsletter terlebih dahulu.", "is-warning");
            return;
        }

        const data = { topik: dipilih, disimpanPada: new Date().toISOString() };

        try {
            localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(data));
            tampilkanStatus("✓ Preferensi newsletter tersimpan di peramban ini.", "is-success");
        } catch (error) {
            console.error("Gagal menyimpan preferensi newsletter:", error);
            tampilkanStatus("Penyimpanan lokal tidak tersedia di peramban ini.", "is-warning");
        }
    }

    function muatNewsletter() {
        try {
            const raw = localStorage.getItem(NEWSLETTER_KEY);
            if (!raw) return;

            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.topik)) throw new Error("Struktur data tidak valid");

            checkboxes.forEach((cb) => {
                cb.checked = data.topik.includes(cb.value);
            });
            tampilkanStatus("ℹ Preferensi newsletter tersimpan berhasil dimuat.", "is-info");
        } catch (error) {
            console.warn("Data newsletter rusak, dihapus dari localStorage.", error);
            try { localStorage.removeItem(NEWSLETTER_KEY); } catch (e) { /* abaikan */ }
        }
    }

    function hapusNewsletter() {
        try {
            localStorage.removeItem(NEWSLETTER_KEY);
        } catch (error) {
            console.error("Gagal menghapus preferensi newsletter:", error);
        }
        checkboxes.forEach((cb) => { cb.checked = false; });
        tampilkanStatus("Preferensi newsletter dihapus.", "is-warning");
    }

    formNewsletter.addEventListener("submit", (event) => {
        event.preventDefault();
        simpanNewsletter();
    });
    if (btnHapus) btnHapus.addEventListener("click", hapusNewsletter);

    muatNewsletter();
})();