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

/**
 * Galeri foto ruangan (Denah Villa)
 * Untuk menambah foto, tambahkan path-nya ke daftar "photos" ruangan terkait,
 * misalnya: photos: ['foto/kamar.jpg?v=2', 'foto/kamar-2.jpg']
 */
const ROOM_PHOTOS = {
    lapangan:    { title: 'Lapangan & Area Parkir', photos: ['foto/lapangan.jpg?v=2'] },
    pool:        { title: 'Private Pool',           photos: ['foto/pool.jpg?v=2'] },
    ruangtengah: { title: 'Ruang Tengah',           photos: ['foto/ruang-tengah.jpg?v=2'] },
    dapur:       { title: 'Dapur',                  photos: ['foto/dapur.jpg?v=2'] },
    fasilitas:   { title: 'Fasilitas',              photos: ['foto/fasilitas.jpg?v=2'] },
    kamar:       { title: 'Kamar Tidur',            photos: ['foto/kamar.jpg?v=2'] },
    karaoke:     { title: 'Ruang Karaoke',          photos: ['foto/karaoke.jpg?v=2'] },
    toilet:      { title: 'Toilet & Kamar Mandi',   photos: ['foto/toilet.jpg?v=2'] }
};

let galleryRoom = null;
let galleryIndex = 0;

function openGallery(key) {
    const room = ROOM_PHOTOS[key];
    if (!room) return;
    galleryRoom = room;
    galleryIndex = 0;

    document.getElementById('galleryTitle').textContent = room.title;
    document.getElementById('galleryModal').classList.toggle('single', room.photos.length < 2);

    const thumbs = document.getElementById('galleryThumbs');
    thumbs.innerHTML = '';
    room.photos.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gallery-thumb';
        btn.setAttribute('aria-label', 'Foto ' + (i + 1));
        btn.onclick = () => showGalleryPhoto(i);
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        btn.appendChild(img);
        thumbs.appendChild(btn);
    });

    showGalleryPhoto(0);
    document.getElementById('galleryModal').classList.add('open');
    document.body.classList.add('modal-open');
}

function showGalleryPhoto(index) {
    if (!galleryRoom) return;
    const total = galleryRoom.photos.length;
    galleryIndex = (index + total) % total;

    const img = document.getElementById('galleryImg');
    const errorBox = document.getElementById('galleryError');
    const src = galleryRoom.photos[galleryIndex];
    errorBox.hidden = true;
    img.style.visibility = 'visible';
    img.onerror = () => {
        img.style.visibility = 'hidden';
        errorBox.textContent = 'Foto tidak ditemukan: ' + src + ' (pastikan folder "foto" ikut di-upload ke repo)';
        errorBox.hidden = false;
    };
    img.src = src;
    img.alt = galleryRoom.title + ' - foto ' + (galleryIndex + 1);
    document.getElementById('galleryCounter').textContent = (galleryIndex + 1) + ' / ' + total;

    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === galleryIndex);
    });
}

function stepGallery(delta) {
    showGalleryPhoto(galleryIndex + delta);
}

function closeGallery() {
    document.getElementById('galleryModal').classList.remove('open');
    document.body.classList.remove('modal-open');
    galleryRoom = null;
}

document.addEventListener('keydown', e => {
    if (!galleryRoom) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') stepGallery(-1);
    if (e.key === 'ArrowRight') stepGallery(1);
});

// Geser kiri/kanan di HP untuk ganti foto
(function () {
    const stage = document.getElementById('galleryStage');
    if (!stage) return;
    let startX = null;
    stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) stepGallery(dx < 0 ? 1 : -1);
        startX = null;
    });
})();
