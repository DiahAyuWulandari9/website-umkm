(() => {
"use strict";

const STORAGE_KEY_PREFERENCES = "noura_bites_preferences";

// 1. Seleksi elemen DOM utama
const form = document.querySelector("#form-kontak");
const preview = document.querySelector("#preview-form");
const selectPaket = document.querySelector("#paket");
const btnSimpanPref = document.querySelector("#btn-simpan-pref");
const btnHapusPref = document.querySelector("#btn-hapus-pref");
const statusPref = document.querySelector("#status-preferensi");

// Guard clause: pastikan form kontak dan preview tersedia sebelum menjalankan logika
if (form && preview) {
    initForm();
}

/**
 * 2. Inisialisasi Event Listener dan Pemuatan Awal
 */
function initForm() {
    // Muat preferensi pengunjung dari localStorage saat halaman dibuka
    muatPreferensi();

    // Daftarkan event listener tombol preferensi
    if (btnSimpanPref) {
        btnSimpanPref.addEventListener("click", simpanPreferensi);
    }
    if (btnHapusPref) {
        btnHapusPref.addEventListener("click", hapusPreferensi);
    }

    // Event listener submit formulir
    form.addEventListener("submit", handleSubmit);

    // Seleksi seluruh elemen input form untuk pengaturan validasi interaktif
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
        // 1. Validasi saat pengguna selesai mengisi dan berpindah ke kolom lain (event blur)
        input.addEventListener("blur", () => {
            input.dataset.validated = "true";
            validasiField(input, true);
        });

        // 2. Saat mengetik (event input): hanya perbarui atau hapus error jika kolom sudah pernah divalidasi
        input.addEventListener("input", () => {
            // Jika kolom belum pernah divalidasi (belum pernah blur/submit), jangan tampilkan error saat mengetik
            if (input.dataset.validated !== "true") {
                return;
            }

            // Jika pengguna mengosongkan kolom, tunda validasi hingga pengguna meninggalkan kolom (blur)
            if (input.value.length === 0) {
                input.removeAttribute("aria-invalid");
                const errorEl = document.querySelector(`#error-${input.name}`);
                if (errorEl) errorEl.textContent = "";
                return;
            }

            // Jika sedang diisi, evaluasi apakah sudah valid atau perlu memperbarui pesan error
            validasiField(input, true);
        });

        // 3. Event change: untuk select dan radio, segera evaluasi ketika pilihan diubah
        if (input.type === "radio" || input.tagName === "SELECT") {
            input.addEventListener("change", () => {
                input.dataset.validated = "true";
                validasiField(input, true);
            });
        }
    });
}

/**
 * 3. Logika Validasi Per Field Menggunakan Constraint Validation API
 */
function validasiField(field, shouldShowError = true) {
    // Validasi khusus untuk kelompok radio button
    if (field.type === "radio") {
        return validasiRadioGroup(field.name, shouldShowError);
    }

    const errorEl = document.querySelector(`#error-${field.name}`);

    // Bersihkan custom validity lama agar validitas bawaan browser dapat dievaluasi ulang
    field.setCustomValidity("");

    // Pemeriksaan khusus untuk field Nama dan Pesan: tidak boleh hanya berisi spasi
    if (field.name === "nama" || field.name === "pesan") {
        const trimmedValue = field.value.trim();
        if (field.value.length > 0 && trimmedValue.length === 0) {
            const pesanSpasi = field.name === "nama"
                ? "Nama lengkap tidak boleh hanya berisi spasi."
                : "Pesan tidak boleh hanya berisi spasi.";
            field.setCustomValidity(pesanSpasi);
        } else if (trimmedValue.length > 0 && trimmedValue.length < field.minLength) {
            const pesanPendek = `${field.name === "nama" ? "Nama lengkap" : "Pesan"} terlalu pendek (minimal ${field.minLength} karakter, saat ini ${trimmedValue.length} karakter).`;
            field.setCustomValidity(pesanPendek);
        }
    }

    // Evaluasi validitas menggunakan Constraint Validation API (.checkValidity() dan .validity)
    if (!field.checkValidity()) {
        if (shouldShowError) {
            let pesanError = "";

            if (field.validity.customError) {
                pesanError = field.validationMessage;
            } else if (field.validity.valueMissing) {
                switch (field.name) {
                    case "nama":
                        pesanError = "Nama lengkap wajib diisi.";
                        break;
                    case "email":
                        pesanError = "Alamat email wajib diisi.";
                        break;
                    case "whatsapp":
                        pesanError = "Nomor WhatsApp wajib diisi.";
                        break;
                    case "paket":
                        pesanError = "Silakan pilih salah satu produk yang diminati.";
                        break;
                    case "pesan":
                        pesanError = "Pesan pertanyaan atau pesanan wajib diisi.";
                        break;
                    case "setuju":
                        pesanError = "Anda harus menyetujui bahwa data yang diisi adalah data dummy sebelum melihat preview.";
                        break;
                    default:
                        pesanError = "Field ini wajib diisi.";
                }
            } else if (field.validity.typeMismatch && field.type === "email") {
                pesanError = "Format email tidak valid. Pastikan menyertakan '@' dan domain yang benar (contoh: nama@email.com).";
            } else if (field.validity.patternMismatch && field.name === "whatsapp") {
                pesanError = "Nomor WhatsApp tidak valid. Gunakan format +62 diikuti angka yang diawali 8 (contoh: +6281234567890).";
            } else if (field.validity.tooShort) {
                const currentLen = field.value.trim().length;
                const minLen = field.minLength;
                pesanError = `${field.name === "nama" ? "Nama lengkap" : "Pesan"} terlalu pendek (minimal ${minLen} karakter, saat ini ${currentLen} karakter).`;
            } else {
                pesanError = field.validationMessage || "Data yang dimasukkan tidak valid.";
            }

            // Samakan pesan bawaan browser dengan pesan custom (dipakai reportValidity)
            field.setCustomValidity(pesanError);

            // Terapkan penanda aksesibilitas aria-invalid dan tampilkan pesan kesalahan via textContent
            field.setAttribute("aria-invalid", "true");
            if (errorEl) {
                errorEl.textContent = pesanError;
            }
        }
        return false;
    }

    // Jika field valid: hapus penanda error dan kosongkan kontainer pesan
    field.removeAttribute("aria-invalid");
    if (errorEl) {
        errorEl.textContent = "";
    }
    field.setCustomValidity("");
    return true;
}

function validasiRadioGroup(name, shouldShowError = true) {
    const errorEl = document.querySelector(`#error-${name}`);
    const fieldset = form.querySelector(`fieldset[aria-describedby~="error-${name}"]`);
    const checkedRadio = form.querySelector(`input[name="${name}"]:checked`);

    const radios = form.querySelectorAll(`input[name="${name}"]`);

    if (!checkedRadio) {
        const pesanRadio = name === "topik"
            ? "Silakan pilih salah satu topik pertanyaan."
            : "Silakan pilih waktu yang diinginkan untuk dihubungi.";
        radios.forEach((radio) => radio.setCustomValidity(pesanRadio));

        if (shouldShowError) {
            if (fieldset) {
                fieldset.setAttribute("aria-invalid", "true");
            }
            if (errorEl) {
                errorEl.textContent = name === "topik"
                    ? "Silakan pilih salah satu topik pertanyaan."
                    : "Silakan pilih waktu yang diinginkan untuk dihubungi.";
            }
        }
        return false;
    }

    // Jika opsi radio sudah dipilih:
    radios.forEach((radio) => radio.setCustomValidity(""));
    if (fieldset) {
        fieldset.removeAttribute("aria-invalid");
    }
    if (errorEl) {
        errorEl.textContent = "";
    }
    return true;
}

/**
 * 4. Handler Submit Formulir dengan Focus Management & Preview Protection
 */
function handleSubmit(event) {
    event.preventDefault();

    let isFormValid = true;
    let firstInvalidField = null;

    // Tandai semua field sebagai sudah divalidasi ketika tombol submit ditekan
    const allInputs = form.querySelectorAll("input, select, textarea");
    allInputs.forEach((el) => {
        el.dataset.validated = "true";
    });

    // Urutan field untuk divalidasi dan penentuan fokus pertama
    const fieldNames = ["nama", "email", "whatsapp", "paket", "topik", "waktu", "pesan", "setuju"];

    fieldNames.forEach((name) => {
        let fieldValid = true;

        if (name === "topik" || name === "waktu") {
            fieldValid = validasiRadioGroup(name);
            if (!fieldValid && !firstInvalidField) {
                firstInvalidField = form.querySelector(`input[name="${name}"]`);
            }
        } else {
            const inputField = form.elements[name];
            if (inputField) {
                fieldValid = validasiField(inputField, true);
                if (!fieldValid && !firstInvalidField) {
                    firstInvalidField = inputField;
                }
            }
        }

        if (!fieldValid) {
            isFormValid = false;
        }
    });

    // PENTING: Jika formulir tidak valid, JANGAN tampilkan preview sebagai data valid
    if (!isFormValid || !form.checkValidity()) {
        preview.textContent = "⚠ Formulir belum dapat diproses. Mohon periksa kembali dan lengkapi field yang ditandai kesalahan di atas.";
        preview.classList.remove("status-success");
        preview.classList.add("status-danger");

        // Focus management: otomatis pindahkan fokus ke elemen invalid pertama
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        // Pesan bawaan browser sudah diganti pesan custom lewat setCustomValidity()
        form.reportValidity();
        return;
    }

    // Formulir valid: tampilkan data preview lengkap
    tampilkanPreviewSukses();
}

/**
 * 5. Render Preview Data Valid (Aman dari XSS / Anti-innerHTML)
 */
function tampilkanPreviewSukses() {
    const formData = new FormData(form);

    // Pemetaan label ramah baca untuk nilai paket produk, topik, dan waktu
    const mapPaket = {
        "chocolate-almond": "Chocolate Almond",
        "coconut-choco": "Coconut Choco",
        "smart-snack-mix": "Smart Snack Mix",
        "almond-crunch": "Almond Crunch",
        "coconut-choco-bites": "Coconut Choco Bites"
    };

    const mapTopik = {
        "pemesanan": "Pemesanan",
        "harga": "Harga dan Ketersediaan",
        "kerja-sama": "Kerja Sama"
    };

    const mapWaktu = {
        "pagi": "Pagi",
        "siang": "Siang",
        "sore": "Sore"
    };

    const paketVal = formData.get("paket");
    const topikVal = formData.get("topik");
    const waktuVal = formData.get("waktu");

    const barisData = [
        "✓ Berhasil — data form berhasil diproses dan valid.",
        "--------------------------------------------------",
        `Nama     : ${formData.get("nama")}`,
        `Email    : ${formData.get("email")}`,
        `WhatsApp : ${formData.get("whatsapp")}`,
        `Produk   : ${mapPaket[paketVal] || paketVal}`,
        `Topik    : ${mapTopik[topikVal] || topikVal}`,
        `Waktu    : ${mapWaktu[waktuVal] || waktuVal}`,
        `Pesan    : ${formData.get("pesan")}`,
        "--------------------------------------------------",
        `Waktu Submit: ${new Date().toLocaleString("id-ID")}`
    ];

    // Hindari innerHTML — gunakan textContent untuk keamanan data pengguna
    preview.textContent = barisData.join("\n");
    preview.classList.remove("status-danger");
    preview.classList.add("status-success");

    // Scroll halus ke area preview agar pengguna segera melihat hasil validasi sukses
    preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * 6. Manajemen Preferensi Kontak Pengunjung (localStorage, JSON, dan try...catch)
 */

function tampilkanStatusPreferensi(pesan, tipe = "is-info") {
    if (!statusPref) return;

    statusPref.textContent = pesan;
    statusPref.className = `preference-status ${tipe}`;

    // Otomatis bersihkan status sukses atau peringatan setelah 4 detik
    if (tipe !== "is-info") {
        setTimeout(() => {
            if (statusPref.textContent === pesan) {
                statusPref.textContent = "";
                statusPref.className = "preference-status";
            }
        }, 4000);
    }
}

function simpanPreferensi() {
    const paket = selectPaket ? selectPaket.value : "";
    const radioTopik = form.querySelector('input[name="topik"]:checked');
    const radioWaktu = form.querySelector('input[name="waktu"]:checked');

    const topik = radioTopik ? radioTopik.value : "";
    const waktu = radioWaktu ? radioWaktu.value : "";

    // Validasi: pastikan minimal ada 1 pilihan preferensi yang ditentukan
    if (!paket && !topik && !waktu) {
        tampilkanStatusPreferensi("Silakan tentukan minimal satu pilihan (produk, topik, atau waktu) sebelum menyimpan preferensi.", "is-warning");
        return;
    }

    // Hanya menyimpan data preferensi non-sensitif (tanpa data pribadi nama/email/pesan)
    const dataPreferensi = {
        paket: paket,
        topik: topik,
        waktu: waktu,
        disimpanPada: new Date().toISOString()
    };

    try {
        const jsonString = JSON.stringify(dataPreferensi);
        localStorage.setItem(STORAGE_KEY_PREFERENCES, jsonString);
        tampilkanStatusPreferensi("✓ Preferensi pengunjung berhasil disimpan ke peramban.", "is-success");
        console.log("Preferensi tersimpan di localStorage:", dataPreferensi);
    } catch (error) {
        console.error("Gagal menyimpan preferensi ke localStorage:", error);
        tampilkanStatusPreferensi("Penyimpanan lokal tidak tersedia atau dibatasi oleh peramban.", "is-warning");
    }
}

function muatPreferensi() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY_PREFERENCES);
        if (!rawData) {
            // Belum ada preferensi tersimpan, halaman tetap berjalan normal
            return;
        }

        const data = JSON.parse(rawData);

        // Verifikasi keabsahan struktur data hasil parsing
        if (data && typeof data === "object") {
            let adaDataDimuat = false;

            if (data.paket && selectPaket) {
                selectPaket.value = data.paket;
                adaDataDimuat = true;
            }

            if (data.topik) {
                const targetTopik = form.querySelector(`input[name="topik"][value="${data.topik}"]`);
                if (targetTopik) {
                    targetTopik.checked = true;
                    adaDataDimuat = true;
                }
            }

            if (data.waktu) {
                const targetWaktu = form.querySelector(`input[name="waktu"][value="${data.waktu}"]`);
                if (targetWaktu) {
                    targetWaktu.checked = true;
                    adaDataDimuat = true;
                }
            }

            if (adaDataDimuat) {
                tampilkanStatusPreferensi("ℹ Preferensi pengunjung tersimpan berhasil dimuat ke formulir.", "is-info");
                console.log("Preferensi dimuat dari localStorage:", data);
            }
        }
    } catch (error) {
        // Penanganan data rusak (corrupted JSON) secara aman
        console.warn("Data preferensi di localStorage rusak atau tidak valid. Membersihkan data secara aman:", error);
        try {
            localStorage.removeItem(STORAGE_KEY_PREFERENCES);
        } catch (e) {
            // Abaikan kegagalan saat mencoba menghapus
        }
    }
}

function hapusPreferensi() {
    try {
        localStorage.removeItem(STORAGE_KEY_PREFERENCES);

        // Reset field preferensi pada form ke nilai awal
        if (selectPaket) {
            selectPaket.value = "";
        }

        const checkedRadios = form.querySelectorAll('input[name="topik"]:checked, input[name="waktu"]:checked');
        checkedRadios.forEach((radio) => {
            radio.checked = false;
        });

        // Bersihkan atribut aria-invalid pada fieldset jika sebelumnya ada
        const fieldsets = form.querySelectorAll("fieldset");
        fieldsets.forEach((fs) => fs.removeAttribute("aria-invalid"));

        tampilkanStatusPreferensi("Preferensi pengunjung berhasil dihapus dari peramban.", "is-warning");
        console.log("Preferensi telah dihapus dari localStorage.");
    } catch (error) {
        console.error("Gagal menghapus preferensi dari localStorage:", error);
    }
}

})();