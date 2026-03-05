/* ============================================
   EventCert — Student Dashboard Logic
   Event rendering, registration, certificates
   ============================================ */

// ── Globals ──
let currentSection = 'overview';
let allEvents = [];
let userRegistrations = [];
let userCertificates = [];
let currentUser = null;

// ── Initialize Dashboard ──
document.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth();
    if (!currentUser) return;

    // Redirect organizer to admin
    if (currentUser.role === 'organizer') {
        window.location.href = 'admin.html';
        return;
    }

    setupUserUI();
    loadData();
    renderOverview();
});

// ── Setup User UI ──
function setupUserUI() {
    const initials = getInitials(currentUser.full_name);
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent = currentUser.full_name;
    document.getElementById('welcome-name').textContent = currentUser.full_name.split(' ')[0];
    document.getElementById('dropdown-name').textContent = currentUser.full_name;
    document.getElementById('dropdown-email').textContent = currentUser.email;
}

// ── Toggle User Dropdown ──
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const userBtn = document.querySelector('.navbar-user');
    if (dropdown && userBtn && !userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// ── Load Data from localStorage ──
function loadData() {
    allEvents = JSON.parse(localStorage.getItem('eventcert_events') || '[]');
    userRegistrations = JSON.parse(localStorage.getItem('eventcert_registrations') || '[]')
        .filter(r => r.user_id === currentUser.id);
    userCertificates = JSON.parse(localStorage.getItem('eventcert_certificates') || '[]')
        .filter(c => c.user_id === currentUser.id);
}

// ── Section Navigation ──
function showSection(section) {
    currentSection = section;

    // Hide all sections
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    // Show target
    const target = document.getElementById(`section-${section}`);
    if (target) {
        target.style.display = 'block';
    }

    const navLink = document.getElementById(`nav-${section}`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Render section
    loadData();
    switch (section) {
        case 'overview': renderOverview(); break;
        case 'upcoming': renderUpcomingEvents(); break;
        case 'current': renderCurrentEvents(); break;
        case 'registered': renderRegistrations(); break;
        case 'certificates': renderCertificates(); break;
    }
}

// ── Get Event Status ──
function getEventStatus(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);

    if (diffHours > 24) return 'upcoming';
    if (diffHours > -24) return 'current';
    return 'past';
}

// ── Render Overview ──
function renderOverview() {
    const upcomingEvents = allEvents.filter(e => getEventStatus(e) === 'upcoming');
    const currentEvents = allEvents.filter(e => getEventStatus(e) === 'current');

    // Update stats
    document.getElementById('stat-upcoming').textContent = upcomingEvents.length;
    document.getElementById('stat-current').textContent = currentEvents.length;
    document.getElementById('stat-registered').textContent = userRegistrations.length;
    document.getElementById('stat-certificates').textContent = userCertificates.length;

    // Current events preview (max 3)
    const currentContainer = document.getElementById('overview-current-events');
    if (currentEvents.length > 0) {
        currentContainer.innerHTML = currentEvents.slice(0, 3).map(e => createEventCard(e)).join('');
    } else {
        currentContainer.innerHTML = `
            <div class="empty-state glass-card" style="grid-column:1/-1;">
                <div class="empty-icon">⚡</div>
                <div class="empty-title">No current events</div>
                <div class="empty-desc">Check back soon for live events!</div>
            </div>`;
    }

    // Upcoming events preview (max 3)
    const upcomingContainer = document.getElementById('overview-upcoming-events');
    if (upcomingEvents.length > 0) {
        upcomingContainer.innerHTML = upcomingEvents.slice(0, 3).map(e => createEventCard(e)).join('');
    } else {
        upcomingContainer.innerHTML = `
            <div class="empty-state glass-card" style="grid-column:1/-1;">
                <div class="empty-icon">📅</div>
                <div class="empty-title">No upcoming events</div>
                <div class="empty-desc">Events will appear here</div>
            </div>`;
    }
}

// ── Render Upcoming Events ──
function renderUpcomingEvents() {
    const events = allEvents.filter(e => getEventStatus(e) === 'upcoming');
    const grid = document.getElementById('upcoming-events-grid');

    if (events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state glass-card" style="grid-column:1/-1;">
                <div class="empty-icon">📅</div>
                <div class="empty-title">No upcoming events</div>
                <div class="empty-desc">New events will be added by organizers soon.</div>
            </div>`;
        return;
    }

    grid.innerHTML = events.map(e => createEventCard(e)).join('');
}

// ── Render Current Events ──
function renderCurrentEvents() {
    const events = allEvents.filter(e => getEventStatus(e) === 'current');
    const grid = document.getElementById('current-events-grid');

    if (events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state glass-card" style="grid-column:1/-1;">
                <div class="empty-icon">⚡</div>
                <div class="empty-title">No current events</div>
                <div class="empty-desc">No events happening right now.</div>
            </div>`;
        return;
    }

    grid.innerHTML = events.map(e => createEventCard(e)).join('');
}

// ── Create Event Card HTML ──
function createEventCard(event) {
    const status = getEventStatus(event);
    const isRegistered = userRegistrations.some(r => r.event_id === event.id);

    // Generate banner gradient based on event category
    const gradients = {
        'Technology': 'linear-gradient(135deg, #667eea, #764ba2)',
        'Security': 'linear-gradient(135deg, #f093fb, #f5576c)',
        'Cloud': 'linear-gradient(135deg, #4facfe, #00f2fe)',
        'Data Science': 'linear-gradient(135deg, #43e97b, #38f9d7)',
        'Mobile': 'linear-gradient(135deg, #fa709a, #fee140)',
        'default': 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    };
    const gradient = gradients[event.category] || gradients['default'];

    const registerBtn = isRegistered
        ? `<span class="badge badge-success">✅ Registered</span>`
        : status === 'past'
            ? `<span class="badge badge-warning">Event Ended</span>`
            : `<button class="btn btn-primary btn-sm" onclick="registerForEvent(${event.id}); event.stopPropagation();">Register</button>`;

    return `
        <div class="event-card animate-in" onclick="showEventDetails(${event.id})">
            <div class="event-card-banner" style="background:${gradient};display:flex;align-items:center;justify-content:center;">
                <span style="font-size:2.5rem;">${getCategoryEmoji(event.category)}</span>
                <span class="event-badge ${status}">${status}</span>
            </div>
            <div class="event-card-body">
                <h3 class="event-card-title">${event.title}</h3>
                <p class="event-card-desc">${event.description}</p>
                <div class="event-card-meta">
                    <div class="event-meta-item">
                        <span class="icon">📅</span>
                        <span>${formatDate(event.date)}</span>
                    </div>
                    <div class="event-meta-item">
                        <span class="icon">📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-meta-item">
                        <span class="icon">👤</span>
                        <span>${event.organizer_name}</span>
                    </div>
                </div>
                <div class="event-card-footer">
                    <div class="event-meta-item">
                        <span class="icon">👥</span>
                        <span>Max ${event.max_attendees}</span>
                    </div>
                    ${registerBtn}
                </div>
            </div>
        </div>
    `;
}

// ── Category Emoji Helper ──
function getCategoryEmoji(category) {
    const emojis = {
        'Technology': '💻',
        'Security': '🔐',
        'Cloud': '☁️',
        'Data Science': '📊',
        'Mobile': '📱'
    };
    return emojis[category] || '🎯';
}

// ── Register for Event ──
function registerForEvent(eventId) {
    let registrations = JSON.parse(localStorage.getItem('eventcert_registrations') || '[]');

    if (registrations.some(r => r.user_id === currentUser.id && r.event_id === eventId)) {
        showToast('You are already registered for this event!', 'warning');
        return;
    }

    const newReg = {
        id: registrations.length + 1,
        user_id: currentUser.id,
        event_id: eventId,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        registration_at: new Date().toISOString()
    };

    registrations.push(newReg);
    localStorage.setItem('eventcert_registrations', JSON.stringify(registrations));

    showToast('Successfully registered! 🎉', 'success');

    // Reload current section
    loadData();
    showSection(currentSection);
}

// ── Render Registrations Table ──
function renderRegistrations() {
    const tableContainer = document.getElementById('registrations-table-container');
    const emptyState = document.getElementById('no-registrations');
    const tbody = document.getElementById('registrations-tbody');

    if (userRegistrations.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    tbody.innerHTML = userRegistrations.map(reg => {
        const event = allEvents.find(e => e.id === reg.event_id);
        if (!event) return '';
        const status = getEventStatus(event);

        const statusBadge = status === 'upcoming'
            ? '<span class="badge badge-info">Upcoming</span>'
            : status === 'current'
                ? '<span class="badge badge-success">Happening Now</span>'
                : '<span class="badge badge-warning">Completed</span>';

        return `
            <tr>
                <td style="font-weight:600;">${event.title}</td>
                <td>${formatDate(event.date)}</td>
                <td>${event.location}</td>
                <td>${statusBadge}</td>
                <td style="color:var(--text-muted);">${formatDateTime(reg.registration_at)}</td>
            </tr>
        `;
    }).join('');
}

// ── Render Certificates ──
function renderCertificates() {
    const grid = document.getElementById('certificates-grid');
    const emptyState = document.getElementById('no-certificates');

    if (userCertificates.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = userCertificates.map(cert => {
        const event = allEvents.find(e => e.id === cert.event_id);
        const eventTitle = event ? event.title : 'Event';

        return `
            <div class="certificate-preview animate-in">
                <div class="cert-title">Certificate of Participation</div>
                <div class="cert-subtitle">This is to certify that</div>
                <div class="cert-name">${currentUser.full_name}</div>
                <div class="cert-event">has successfully attended<br><strong>${eventTitle}</strong></div>
                <div class="cert-date">Issued on ${formatDate(cert.issued_at)}</div>
                <div style="margin-top:1.5rem;">
                    <button class="btn btn-outline btn-sm" onclick="downloadCertificate(${cert.id}); event.stopPropagation();">
                        📥 Download
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ── Download Certificate (simulated) ──
function downloadCertificate(certId) {
    showToast('Certificate download started! 📥', 'success');
}

// ── Show Event Details Modal ──
function showEventDetails(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    const status = getEventStatus(event);
    const isRegistered = userRegistrations.some(r => r.event_id === event.id);

    document.getElementById('modal-event-title').textContent = event.title;

    const body = document.getElementById('modal-event-body');
    body.innerHTML = `
        <div style="margin-bottom:var(--space-lg);">
            <span class="badge badge-${status === 'upcoming' ? 'info' : status === 'current' ? 'success' : 'warning'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            ${event.category ? `<span class="badge badge-info" style="margin-left:8px;">${event.category}</span>` : ''}
        </div>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-xl);line-height:1.7;">${event.description}</p>
        <div style="display:flex;flex-direction:column;gap:var(--space-md);margin-bottom:var(--space-xl);">
            <div class="event-meta-item">
                <span class="icon">📅</span>
                <span><strong>Date:</strong> ${formatDateTime(event.date)}</span>
            </div>
            <div class="event-meta-item">
                <span class="icon">📍</span>
                <span><strong>Location:</strong> ${event.location}</span>
            </div>
            <div class="event-meta-item">
                <span class="icon">👤</span>
                <span><strong>Organizer:</strong> ${event.organizer_name}</span>
            </div>
            <div class="event-meta-item">
                <span class="icon">👥</span>
                <span><strong>Max Attendees:</strong> ${event.max_attendees}</span>
            </div>
        </div>
        <div style="display:flex;gap:var(--space-md);">
            ${isRegistered
            ? '<span class="badge badge-success" style="padding:0.5rem 1rem;font-size:0.9rem;">✅ You are registered</span>'
            : status !== 'past'
                ? `<button class="btn btn-primary" onclick="registerForEvent(${event.id}); closeEventModal();">Register Now</button>`
                : '<span class="badge badge-warning" style="padding:0.5rem 1rem;">Event has ended</span>'
        }
            <button class="btn btn-secondary" onclick="closeEventModal()">Close</button>
        </div>
    `;

    document.getElementById('event-modal-overlay').classList.add('active');
}

function closeEventModal() {
    document.getElementById('event-modal-overlay').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('event-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEventModal();
});

// ── Search / Filter Events ──
function filterEvents(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        showSection(currentSection);
        return;
    }

    const filtered = allEvents.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
    );

    // Show in whichever grid is currently visible
    const grids = ['upcoming-events-grid', 'current-events-grid', 'overview-current-events', 'overview-upcoming-events'];
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid && grid.closest('.page-section')?.style.display !== 'none') {
            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state glass-card" style="grid-column:1/-1;">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-title">No results found</div>
                        <div class="empty-desc">Try searching with different keywords</div>
                    </div>`;
            } else {
                grid.innerHTML = filtered.map(e => createEventCard(e)).join('');
            }
        }
    });
}
