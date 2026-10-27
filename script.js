/**
 * Berpindah antar Tab Utama (Rundown, Kamar, Kelompok, Denah, Peraturan)
 */
function switchTab(tabName) {
    const targetSection = document.getElementById('content-' + tabName);
    const targetTab = document.getElementById('tab-' + tabName);
    if (!targetSection || !targetTab || targetTab.disabled) {
        return;
    }

    // Sembunyikan semua section
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    
    // Hapus status aktif dari semua tombol tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Tampilkan section yang dipilih
    targetSection.classList.remove('hidden');

    // Aktifkan tombol tab yang dipilih
    targetTab.classList.add('active');
}

function initializeLockedTabs() {
    const isUnlocked = Date.now() >= new Date(2026, 10, 6).getTime();

    ['kamar', 'kelompok'].forEach(tabName => {
        const tab = document.getElementById('tab-' + tabName);
        const section = document.getElementById('content-' + tabName);

        tab.disabled = !isUnlocked;
        tab.setAttribute('aria-disabled', String(!isUnlocked));
        tab.title = isUnlocked ? '' : 'Dibuka pada 6 November 2026';
        tab.querySelector('.tab-lock-icon').hidden = isUnlocked;
        section.querySelector('.unlock-notice').classList.toggle('hidden', isUnlocked);
        section.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('hidden', !isUnlocked);
        });
    });
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

/**
 * Filter Pencarian Nama pada List Kamar
 */
function filterKamar() {
    const query = document.getElementById('searchKamar').value.toLowerCase();
    const cards = document.querySelectorAll('.kamar-card');

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

initializeLockedTabs();