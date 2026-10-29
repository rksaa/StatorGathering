/**
 * Berpindah antar Tab Utama (Rundown, Kamar, Kelompok, Denah, Peraturan)
 * dengan efek transisi halaman mulus (Framer Motion style)
 */
function switchTab(tabName) {
    const targetSection = document.getElementById('content-' + tabName);
    const targetTab = document.getElementById('tab-' + tabName);
    if (!targetSection || !targetTab || targetTab.disabled) {
        return;
    }

    // Sembunyikan semua section dan reset kelas animasi
    document.querySelectorAll('main > section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('tab-page-enter');
    });
    
    // Hapus status aktif dari semua tombol tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Tampilkan section yang dipilih
    targetSection.classList.remove('hidden');

    // Trigger reflow agar animasi selalu berjalan ulang dengan mulus
    void targetSection.offsetWidth;
    targetSection.classList.add('tab-page-enter');

    // Aktifkan tombol tab yang dipilih
    targetTab.classList.add('active');

    // Scroll halus ke atas jika pada layar HP
    if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


/**
 * Filter Rundown Acara berdasarkan Hari
 */
function filterDay(day, evt) {
    const rows = document.querySelectorAll('.day-row');
    const btns = document.querySelectorAll('.day-btn');
    
    // Reset styling semua tombol hari
    btns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-200', 'text-slate-700');
    });

    // Tampilkan/Sembunyikan baris rundown
    if (day === 'all') {
        rows.forEach(r => r.classList.remove('hidden'));
    } else {
        rows.forEach(r => {
            if (r.classList.contains('day-' + day)) {
                r.classList.remove('hidden');
            } else {
                r.classList.add('hidden');
            }
        });
    }

    // Terapkan styling tombol yang diklik
    if (evt && evt.target) {
        evt.target.classList.replace('bg-slate-200', 'bg-blue-600');
        evt.target.classList.replace('text-slate-700', 'text-white');
    }
}

let currentKamarCategory = 'all';

/**
 * Filter Kategori Kamar (Semua, Cewek, Khusus, Cowok)
 */
function filterKamarCategory(category, evt) {
    currentKamarCategory = category;

    const btns = document.querySelectorAll('.kamar-filter-btn');
    btns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        b.classList.add('bg-slate-200', 'text-slate-700');
    });

    if (evt && evt.target) {
        const targetBtn = evt.target.closest('.kamar-filter-btn') || evt.target;
        targetBtn.classList.remove('bg-slate-200', 'text-slate-700');
        targetBtn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    }

    filterKamar();
}

/**
 * Filter Pencarian Nama atau Nomor Kamar pada List Kamar
 */
function filterKamar() {
    const inputEl = document.getElementById('searchKamar');
    const query = inputEl ? inputEl.value.toLowerCase().trim() : '';
    const sections = document.querySelectorAll('.kamar-section');
    let totalVisible = 0;

    sections.forEach(sec => {
        const secCat = sec.getAttribute('data-section');
        const isCatMatch = (currentKamarCategory === 'all' || currentKamarCategory === secCat);
        const cards = sec.querySelectorAll('.kamar-card');
        let secVisibleCount = 0;

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matchesQuery = !query || text.includes(query);

            if (isCatMatch && matchesQuery) {
                card.classList.remove('hidden');
                secVisibleCount++;
                totalVisible++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Tampilkan/sembunyikan section berdasarkan kecocokan kartu
        if (secVisibleCount > 0) {
            sec.classList.remove('hidden');
        } else {
            sec.classList.add('hidden');
        }
    });

    const emptyMsg = document.getElementById('kamarEmpty');
    if (emptyMsg) {
        if (totalVisible === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
        }
    }
}

/**
 * Filter Pencarian Nama pada List Kelompok
 */
function filterKelompok() {
    const query = document.getElementById('searchKelompok').value.toLowerCase();
    const cards = document.querySelectorAll('.kelompok-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/**
 * Isi kartu ringkasan dari data yang ada di halaman
 */
function renderStats() {
    const rows = document.querySelectorAll('.day-row');
    const headers = document.querySelectorAll('.day-row.border-l-4');
    const values = {
        hari: headers.length,
        kegiatan: rows.length - headers.length,
        kamar: document.querySelectorAll('.kamar-card').length,
        kelompok: document.querySelectorAll('.kelompok-card').length
    };
    Object.entries(values).forEach(([key, value]) => {
        const el = document.querySelector('[data-stat="' + key + '"]');
        if (el) el.textContent = value;
    });
}

renderStats();

// Jalankan animasi transisi halus pada tab aktif saat pertama kali dibuka
document.addEventListener('DOMContentLoaded', () => {
    const activeSec = document.querySelector('main > section:not(.hidden)');
    if (activeSec) {
        activeSec.classList.add('tab-page-enter');
    }
});
