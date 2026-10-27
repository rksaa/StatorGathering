const { createElement: h, useEffect, useState } = React;

const eventInfoRequest = fetch('/api/event')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Permintaan data acara gagal (${response.status}).`);
        }
        return response.json();
    })
    .then(
        data => ({ data, error: null }),
        error => ({ data: null, error })
    );

function useEventInfo() {
    const [state, setState] = useState({ loading: true, data: null, error: null });

    useEffect(() => {
        let isMounted = true;
        eventInfoRequest.then(result => {
            if (isMounted) {
                setState({ loading: false, ...result });
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    return state;
}

function EventError({ error }) {
    return h('p', { className: 'event-load-error', role: 'alert' },
        `Informasi acara tidak dapat dimuat: ${error.message}`
    );
}

function Navigation() {
    const { data, error } = useEventInfo();
    const [activeTab, setActiveTab] = useState('rundown');
    const isUnlocked = data ? Date.now() >= Date.parse(`${data.roomsAndGroupsUnlockAt}T00:00:00`) : false;
    const tabs = [
        { id: 'rundown', label: 'Agenda acara', icon: 'fa-clock' },
        { id: 'kamar', label: 'Pembagian kamar', icon: 'fa-bed', locked: !isUnlocked },
        { id: 'kelompok', label: 'Kelompok', icon: 'fa-users', locked: !isUnlocked },
        { id: 'denah', label: 'Denah villa', icon: 'fa-map-location-dot' },
        { id: 'peraturan', label: 'Tata tertib', icon: 'fa-clipboard-list' }
    ];

    useEffect(() => {
        if (data) {
            initializeLockedTabs(data.roomsAndGroupsUnlockAt, data.unlockLabel);
        }
    }, [data]);

    function selectTab(tab) {
        if (tab.locked) {
            return;
        }

        window.switchTab(tab.id);
        setActiveTab(tab.id);
    }

    return h(React.Fragment, null,
        h('nav', { className: 'side-nav', 'aria-label': 'Navigasi utama' },
            h('div', { className: 'side-logo' },
                h('span', { className: 'side-logo-mark', 'aria-hidden': 'true' },
                    h('i', { className: 'fa-solid fa-bolt' })
                ),
                h('span', { className: 'side-logo-copy' }, 'STATOR',
                    h('span', null, `GATHERING ${data ? data.year : '2026'}`)
                )
            ),
            h('div', { className: 'side-items' },
                tabs.map(tab => h('button', {
                    key: tab.id,
                    type: 'button',
                    onClick: () => selectTab(tab),
                    id: `tab-${tab.id}`,
                    className: `tab-btn${activeTab === tab.id ? ' active' : ''}`,
                    disabled: Boolean(tab.locked),
                    'aria-disabled': Boolean(tab.locked),
                    'data-tooltip': tab.locked
                        ? `${tab.label} · Dibuka ${data ? data.unlockLabel : ''}`
                        : tab.label,
                    'aria-label': tab.label
                },
                tab.locked && h('i', { className: 'fa-solid fa-lock tab-lock-icon' }),
                h('i', { className: `fa-solid ${tab.icon}` }),
                h('span', null, tab.label)
                ))
            ),
            h('button', {
                type: 'button',
                className: 'side-top',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                'data-tooltip': 'Kembali ke atas',
                'aria-label': 'Kembali ke atas'
            },
            h('i', { className: 'fa-solid fa-arrow-up' }),
            h('span', null, 'Kembali ke atas')
            )
        ),
        error && h(EventError, { error })
    );
}

function EventHero() {
    const { data, error } = useEventInfo();

    if (error) {
        return h('header', { className: 'event-hero' }, h(EventError, { error }));
    }

    if (!data) {
        return h('header', { className: 'event-hero', 'aria-busy': 'true' },
            h('p', { className: 'hero-description' }, 'Memuat informasi acara...')
        );
    }

    return h('header', { className: 'event-hero' },
        h('div', { className: 'hero-inner' },
            h('div', { className: 'hero-copy' },
                h('span', { className: 'hero-eyebrow' },
                    h('i', { className: 'fa-solid fa-sparkles' }),
                    ` Pedoman kegiatan · ${data.year}`
                ),
                h('h1', null, 'STATOR', h('br', { className: 'hero-break' }), ' GATHERING'),
                h('p', { className: 'hero-description' },
                    'Dua hari untuk berkumpul, berbagi cerita, dan menikmati kebersamaan.'
                ),
                h('div', { className: 'hero-location' },
                    h('i', { className: 'fa-solid fa-location-dot' }),
                    ` ${data.venue}, ${data.location}`
                )
            ),
            h('div', {
                className: 'hero-date-card',
                'aria-label': `Tanggal kegiatan, ${data.dateLabel}`
            },
            h('span', { className: 'hero-date-label' }, 'Simpan tanggalnya'),
            h('strong', null, data.startDay, ' ',
                h('span', null, '—'),
                ` ${data.endDay}`
            ),
            h('span', { className: 'hero-date-month' }, data.monthYear),
            h('span', { className: 'hero-date-duration' },
                h('i', { className: 'fa-regular fa-moon' }),
                ` ${data.duration}`
            )
            )
        )
    );
}

function EventFacts() {
    const { data, error } = useEventInfo();

    if (error) {
        return h(EventError, { error });
    }

    if (!data) {
        return null;
    }

    const facts = [
        { label: 'Tanggal', value: data.dateLabel, icon: 'fa-regular fa-calendar' },
        { label: 'Durasi', value: data.duration, icon: 'fa-regular fa-clock' },
        { label: 'Lokasi', value: data.location, icon: 'fa-solid fa-mountain-sun' }
    ];

    return h('div', { className: 'event-facts', 'aria-label': 'Ringkasan kegiatan' },
        facts.map(fact => h('div', { className: 'event-fact', key: fact.label },
            h('span', { className: 'event-fact-icon' },
                h('i', { className: fact.icon })
            ),
            h('span', null,
                h('small', null, fact.label),
                h('strong', null, fact.value)
            )
        ))
    );
}

ReactDOM.createRoot(document.getElementById('react-navigation')).render(h(Navigation));
ReactDOM.createRoot(document.getElementById('react-hero')).render(h(EventHero));
ReactDOM.createRoot(document.getElementById('react-facts')).render(h(EventFacts));
