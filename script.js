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
    document.querySelectorAll('.day-row').forEach(row => {
        const show = day === 'all' || row.classList.contains('day-' + day);
        row.classList.toggle('hidden', !show);
    });

    document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
}

/**
 * Buka/tutup detail sebuah acara (contoh: susunan Acara Malam)
 */
function toggleDetail(trigger) {
    const detail = trigger.nextElementSibling;
    if (!detail) return;
    const isOpen = detail.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
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
 * Penguncian tab berdasarkan tanggal (mengikuti jam perangkat, tengah malam waktu setempat)
 * Ubah tanggal di sini: new Date(tahun, bulan - 1, tanggal)
 */
const TAB_LOCKS = {
    kamar:    { label: 'List Kamar', unlockAt: new Date(2026, 10, 5) },  // 5 November 2026
    kelompok: { label: 'Kelompok',   unlockAt: new Date(2026, 10, 6) },  // 6 November 2026
    seatbus:  {
        label: 'Seat Bus',
        unlockAt: new Date(2026, 10, 5),                                  // 5 November 2026
        notice: 'Denah seat bus akan dibuka pada',
        onUnlock: () => busEnsureRendered()
    }
};

// Untuk tab yang belum punya gembok/kartu pemberitahuan di HTML, buat lewat JS
function ensureLockUi(cfg, tab, section) {
    if (!tab.querySelector('.tab-lock-icon')) {
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-lock tab-lock-icon';
        tab.appendChild(icon);
    }
    if (!section.querySelector('.unlock-notice')) {
        const box = document.createElement('div');
        box.className = 'unlock-notice bg-white rounded-xl border p-8 text-center space-y-3';
        box.innerHTML =
            '<div class="unlock-icon"><i class="fa-solid fa-lock"></i></div>' +
            '<h2 class="text-xl font-bold text-slate-800">' + cfg.label + ' Belum Dibuka</h2>' +
            '<p class="text-slate-500 text-sm">' + (cfg.notice || 'Akan dibuka pada') + ' <strong class="unlock-date"></strong>.</p>' +
            '<p class="unlock-count"></p>';
        section.insertBefore(box, section.firstChild);
    }
}

function applyTabLocks() {
    const now = new Date();

    Object.entries(TAB_LOCKS).forEach(([name, cfg]) => {
        const unlocked = now >= cfg.unlockAt;
        const tab = document.getElementById('tab-' + name);
        const section = document.getElementById('content-' + name);
        if (!tab || !section) return;

        ensureLockUi(cfg, tab, section);

        const shortDate = cfg.unlockAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        tab.classList.toggle('locked', !unlocked);
        tab.dataset.tooltip = unlocked ? cfg.label : cfg.label + ' (dibuka ' + shortDate + ')';
        tab.querySelector('.tab-lock-icon').hidden = unlocked;

        const notice = section.querySelector('.unlock-notice');
        notice.classList.toggle('hidden', unlocked);
        // Semua isi halaman selain kartu pemberitahuan ikut tersembunyi selama terkunci
        Array.from(section.children).forEach(el => {
            if (el !== notice) el.classList.toggle('hidden', !unlocked);
        });

        if (unlocked) {
            if (cfg.onUnlock) cfg.onUnlock();
        } else {
            const longDate = cfg.unlockAt.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
            const days = Math.ceil((cfg.unlockAt - now) / 86400000);
            section.querySelector('.unlock-date').textContent = longDate;
            section.querySelector('.unlock-count').textContent =
                days <= 1 ? 'Dibuka besok' : 'Dibuka ' + days + ' hari lagi';
        }
    });
}

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

/* =========================================================
   Seat Bus (59 seat, formasi 2-3)
   Format baris: [nomor baris, [[nama, kategori], ...5 kursi A-E]]
   Kategori: mas | perempuan | laki | kosong
   ========================================================= */
const BUS_ROWS = [
    ['01', [['Bang Goly', 'mas'], ['Mang Ade', 'mas'], ['Mas Agus', 'mas'], ['Mas Anton', 'mas'], ['Mas Oki', 'mas']]],
    ['02', [['Radia', 'perempuan'], ['Rani', 'perempuan'], ['Atiq', 'perempuan'], ['Shela', 'perempuan'], ['Tasya', 'perempuan']]],
    ['03', [['Gita', 'perempuan'], ['Nita', 'perempuan'], ['Anita', 'perempuan'], ['Chacha', 'perempuan'], ['Chelly', 'perempuan']]],
    ['04', [['Della', 'perempuan'], ['El Fitri', 'perempuan'], ['Zahra', 'perempuan'], ['Regina', 'perempuan'], ['Maria', 'perempuan']]],
    ['05', [['Dewi', 'perempuan'], ['Uni', 'perempuan'], ['Hafiz', 'laki'], ['Nanda', 'laki'], ['Dimas', 'laki']]],
    ['06', [['Mudhya', 'perempuan'], ['Alfia', 'perempuan'], ['Tofik', 'laki'], ['Arif', 'laki'], ['Riksa', 'laki']]],
    ['07', [['Davin', 'laki'], ['Fadli', 'laki'], ['Apri', 'laki'], ['Ryan', 'laki'], ['Jay', 'laki']]],
    ['08', [['Adil', 'laki'], ['Darda', 'laki'], ['Irfan', 'laki'], ['Johari', 'laki'], ['Yanto', 'laki']]],
    ['09', [['Iman', 'laki'], ['Nazmi', 'laki'], ['Arifin Bonge', 'laki'], ['Angga', 'laki'], ['Tomi', 'laki']]],
    ['10', [['Nirwan', 'laki'], ['Farhan', 'laki'], ['Arifin Ilham', 'laki'], ['Riski', 'laki'], ['Rapli', 'laki']]]
];
// Baris 11: hanya sisi kanan (C, D, E); sisi kiri adalah gang/akses pintu belakang
const BUS_ROW_11 = [['Rizky kiwil', 'laki'], ['Iksan', 'laki'], ['Yadi', 'laki']];
// Baris 12: kursi panjang paling belakang (A-F)
const BUS_ROW_12 = [['Dani', 'laki'], ['Ugi', 'laki'], ['Verry', 'laki'], ['Meikel', 'laki'], ['Yusuf', 'laki'], ['[ Kosong ]', 'kosong']];

const BUS_CAT_LABEL = {
    mas: 'Rombongan Depan / Mas',
    perempuan: 'Peserta Perempuan',
    laki: 'Peserta Laki-Laki',
    kosong: 'Kursi Kosong'
};

const busState = { query: '', cat: 'all' };

function busEscape(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function busSeat(seat, name, cat) {
    const label = busEscape(name);
    return '<button type="button" class="bus-seat seat-' + cat + '" data-seat="' + seat +
        '" data-name="' + busEscape(name.toLowerCase()) + '" data-cat="' + cat + '" title="' + label + '">' +
        '<span class="bus-seat-code">' + seat + '<i class="fa-solid fa-chair"></i></span>' +
        '<span class="bus-seat-name">' + label + '</span></button>';
}

function busRender() {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    let html = '';

    BUS_ROWS.forEach(([row, seats]) => {
        const cells = seats.map(([name, cat], i) => busSeat(row + letters[i], name, cat));
        html += '<div class="bus-row"><span class="bus-row-label">B-' + row + '</span>' +
            cells[0] + cells[1] + '<span class="bus-gang">| |</span>' + cells[2] + cells[3] + cells[4] + '</div>';
    });

    html += '<div class="bus-row bus-row-sep"><span class="bus-row-label bus-row-11">B-11</span>' +
        '<div class="bus-access"><i class="fa-solid fa-arrows-left-right"></i> Area gang / akses pintu belakang</div>' +
        '<span class="bus-gang">| |</span>' +
        BUS_ROW_11.map(([name, cat], i) => busSeat('11' + ['C', 'D', 'E'][i], name, cat)).join('') + '</div>';

    html += '<div class="bus-row bus-row-sep"><span class="bus-row-label bus-row-12">B-12<small>Belakang</small></span>' +
        '<div class="bus-back"><div class="bus-back-title"><span><i class="fa-solid fa-couch"></i> Kursi panjang paling belakang (6 seat)</span><span>Baris belakang bus</span></div>' +
        '<div class="bus-back-grid">' +
        BUS_ROW_12.map(([name, cat], i) => busSeat('12' + ['A', 'B', 'C', 'D', 'E', 'F'][i], name, cat)).join('') +
        '</div></div></div>';

    document.getElementById('busLayout').innerHTML = html;
}

function busUpdateCounts() {
    const seats = [...document.querySelectorAll('.bus-seat')];
    const count = cat => seats.filter(s => s.dataset.cat === cat).length;
    const total = seats.length;
    const empty = count('kosong');
    const values = { all: total, mas: count('mas'), perempuan: count('perempuan'), laki: count('laki'), kosong: empty };
    Object.entries(values).forEach(([key, value]) => {
        const el = document.querySelector('[data-bus-count="' + key + '"]');
        if (el) el.textContent = value;
    });
    const stats = { total: total + ' seat', terisi: (total - empty) + ' orang', sisa: empty + ' seat' };
    Object.entries(stats).forEach(([key, value]) => {
        const el = document.querySelector('[data-bus-stat="' + key + '"]');
        if (el) el.textContent = value;
    });
}

// Terapkan pencarian + filter kategori sekaligus
function busApply() {
    const input = document.getElementById('busSearch');
    busState.query = input.value.toLowerCase().trim();
    document.getElementById('busClear').hidden = busState.query === '';

    let first = null;
    document.querySelectorAll('.bus-seat').forEach(seat => {
        const text = seat.dataset.name + ' ' + seat.dataset.seat.toLowerCase();
        const matchName = busState.query === '' || text.includes(busState.query);
        const matchCat = busState.cat === 'all' || seat.dataset.cat === busState.cat;
        const hit = busState.query !== '' && matchName && matchCat;
        seat.classList.toggle('bus-match', hit);
        seat.classList.toggle('bus-dim', !(matchName && matchCat));
        if (hit && !first) first = seat;
    });

    if (first && busState.query.length >= 2) {
        first.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
}

function busClearSearch() {
    document.getElementById('busSearch').value = '';
    busApply();
}

function busFilter(cat) {
    busState.cat = cat;
    document.querySelectorAll('.bus-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.cat === cat);
    });
    busApply();
}

function busReset() {
    document.getElementById('busSearch').value = '';
    busFilter('all');
}

function busShowSeat(seatEl) {
    const seat = seatEl.dataset.seat;
    const cat = seatEl.dataset.cat;
    const name = seatEl.getAttribute('title');
    const row = seat.slice(0, 2);
    const letter = seat.slice(2);
    const isEmpty = cat === 'kosong';

    let side = 'Sisi Kanan Bus (3 Kursi)';
    if (row === '12') side = 'Kursi Panjang Belakang (6 Seat)';
    else if (letter === 'A' || letter === 'B') side = 'Sisi Kiri Bus (2 Kursi)';

    document.getElementById('busModalBadge').textContent = seat;
    document.getElementById('busModalName').textContent = name;
    const catEl = document.getElementById('busModalCat');
    catEl.textContent = BUS_CAT_LABEL[cat] || '';
    catEl.className = 'bus-cat-chip seat-' + cat;
    document.getElementById('busModalSeat').textContent = seat;
    document.getElementById('busModalSide').textContent = side;
    const status = document.getElementById('busModalStatus');
    status.textContent = isEmpty ? 'Tersedia / Kosong' : 'Terisi (Terdaftar)';
    status.className = isEmpty ? 'bus-status-empty' : 'bus-status-ok';

    document.getElementById('busModal').classList.add('open');
    document.body.classList.add('modal-open');
}

function busCloseModal() {
    document.getElementById('busModal').classList.remove('open');
    if (!document.getElementById('galleryModal').classList.contains('open')) {
        document.body.classList.remove('modal-open');
    }
}

function busEnsureRendered() {
    const layout = document.getElementById('busLayout');
    if (!layout || layout.childElementCount > 0) return;
    busRender();
    busUpdateCounts();
}

(function () {
    const layout = document.getElementById('busLayout');
    if (!layout) return;
    layout.addEventListener('click', e => {
        const seat = e.target.closest('.bus-seat');
        if (seat) busShowSeat(seat);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') busCloseModal();
    });
})();

// Terapkan kunci tab setelah semua fungsi dan data (termasuk Seat Bus) siap
applyTabLocks();
setInterval(applyTabLocks, 60000); // buka otomatis jika halaman masih terbuka saat tanggalnya tiba
