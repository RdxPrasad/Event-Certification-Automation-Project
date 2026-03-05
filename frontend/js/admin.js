/* ============================================
   EventCert — Admin Panel Logic
   Event CRUD, CSV parsing, certificate gen, email
   ============================================ */

let adminUser = null;
let adminEvents = [];
let allRegistrations = [];
let allCertificates = [];
let parsedAttendees = [];
let emailsSent = parseInt(localStorage.getItem('eventcert_emails_sent') || '0');

// ── Initialize Admin ──
document.addEventListener('DOMContentLoaded', () => {
    adminUser = requireAuth();
    if (!adminUser) return;

    setupAdminUI();
    loadAdminData();
    renderAdminOverview();
    populateEventDropdowns();
});

// ── Setup Admin UI ──
function setupAdminUI() {
    const initials = getInitials(adminUser.full_name);
    document.getElementById('admin-avatar').textContent = initials;
    document.getElementById('admin-name').textContent = adminUser.full_name;
    document.getElementById('admin-dropdown-name').textContent = adminUser.full_name;
    document.getElementById('admin-dropdown-email').textContent = adminUser.email;
}

function toggleAdminMenu() {
    const dropdown = document.getElementById('admin-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('admin-dropdown');
    const userBtn = document.querySelector('.navbar-user');
    if (dropdown && userBtn && !userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// ── Load Data ──
function loadAdminData() {
    adminEvents = JSON.parse(localStorage.getItem('eventcert_events') || '[]');
    allRegistrations = JSON.parse(localStorage.getItem('eventcert_registrations') || '[]');
    allCertificates = JSON.parse(localStorage.getItem('eventcert_certificates') || '[]');
}

// ── Section Navigation ──
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    const target = document.getElementById(`section-${section}`);
    if (target) target.style.display = 'block';

    const navLink = document.getElementById(`nav-${section}`);
    if (navLink) navLink.classList.add('active');

    loadAdminData();
    switch (section) {
        case 'admin-overview': renderAdminOverview(); break;
        case 'manage-events': renderManageEvents(); break;
        case 'attendance': populateEventDropdowns(); break;
        case 'generate-certs': populateEventDropdowns(); break;
        case 'send-emails': populateEventDropdowns(); break;
    }
}

// ── Render Admin Overview ──
function renderAdminOverview() {
    document.getElementById('admin-stat-events').textContent = adminEvents.length;
    document.getElementById('admin-stat-registrations').textContent = allRegistrations.length;
    document.getElementById('admin-stat-certificates').textContent = allCertificates.length;
    document.getElementById('admin-stat-emails').textContent = emailsSent;

    const tbody = document.getElementById('admin-events-tbody');
    tbody.innerHTML = adminEvents.map(event => {
        const status = getEventStatus(event);
        const regCount = allRegistrations.filter(r => r.event_id === event.id).length;

        const statusBadge = status === 'upcoming'
            ? '<span class="badge badge-info">Upcoming</span>'
            : status === 'current'
                ? '<span class="badge badge-success">Current</span>'
                : '<span class="badge badge-warning">Past</span>';

        return `
            <tr>
                <td style="font-weight:600;">${event.title}</td>
                <td>${formatDate(event.date)}</td>
                <td>${event.location}</td>
                <td>${statusBadge}</td>
                <td><span class="badge badge-info">${regCount} registered</span></td>
            </tr>
        `;
    }).join('');
}

// ── Get Event Status (reuse from app.js or define here) ──
function getEventStatus(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    if (diffHours > 24) return 'upcoming';
    if (diffHours > -24) return 'current';
    return 'past';
}

// ── Render Manage Events ──
function renderManageEvents() {
    const grid = document.getElementById('manage-events-grid');

    if (adminEvents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state glass-card" style="grid-column:1/-1;">
                <div class="empty-icon">📅</div>
                <div class="empty-title">No events yet</div>
                <div class="empty-desc">Create your first event to get started!</div>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="showAdminSection('create-event')">➕ Create Event</button>
            </div>`;
        return;
    }

    const gradients = {
        'Technology': 'linear-gradient(135deg, #667eea, #764ba2)',
        'Security': 'linear-gradient(135deg, #f093fb, #f5576c)',
        'Cloud': 'linear-gradient(135deg, #4facfe, #00f2fe)',
        'Data Science': 'linear-gradient(135deg, #43e97b, #38f9d7)',
        'Mobile': 'linear-gradient(135deg, #fa709a, #fee140)',
        'default': 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    };

    const emojis = {
        'Technology': '💻', 'Security': '🔐', 'Cloud': '☁️',
        'Data Science': '📊', 'Mobile': '📱'
    };

    grid.innerHTML = adminEvents.map(event => {
        const status = getEventStatus(event);
        const gradient = gradients[event.category] || gradients['default'];
        const emoji = emojis[event.category] || '🎯';
        const regCount = allRegistrations.filter(r => r.event_id === event.id).length;
        const certCount = allCertificates.filter(c => c.event_id === event.id).length;

        return `
            <div class="event-card animate-in">
                <div class="event-card-banner" style="background:${gradient};display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:2.5rem;">${emoji}</span>
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
                    </div>
                    <div class="event-card-footer">
                        <span class="badge badge-info">👥 ${regCount} reg</span>
                        <span class="badge badge-success">🏆 ${certCount} certs</span>
                        <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ── Create Event ──
function createEvent(e) {
    e.preventDefault();

    const title = document.getElementById('event-title').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date').value;
    const category = document.getElementById('event-category').value;
    const location = document.getElementById('event-location').value;
    const maxAttendees = parseInt(document.getElementById('event-max').value) || 100;

    if (!title || !desc || !date || !location) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    let events = JSON.parse(localStorage.getItem('eventcert_events') || '[]');

    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title,
        description: desc,
        date: new Date(date).toISOString(),
        location,
        organizer_id: adminUser.id,
        organizer_name: adminUser.full_name,
        created_at: new Date().toISOString(),
        status: 'upcoming',
        max_attendees: maxAttendees,
        category
    };

    events.push(newEvent);
    localStorage.setItem('eventcert_events', JSON.stringify(events));

    showToast(`Event "${title}" created successfully! 🎉`, 'success');
    document.getElementById('create-event-form').reset();
    loadAdminData();
    populateEventDropdowns();
}

// ── Delete Event ──
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    let events = JSON.parse(localStorage.getItem('eventcert_events') || '[]');
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem('eventcert_events', JSON.stringify(events));

    // Also remove related registrations and certificates
    let regs = JSON.parse(localStorage.getItem('eventcert_registrations') || '[]');
    regs = regs.filter(r => r.event_id !== eventId);
    localStorage.setItem('eventcert_registrations', JSON.stringify(regs));

    let certs = JSON.parse(localStorage.getItem('eventcert_certificates') || '[]');
    certs = certs.filter(c => c.event_id !== eventId);
    localStorage.setItem('eventcert_certificates', JSON.stringify(certs));

    showToast('Event deleted successfully', 'info');
    loadAdminData();
    renderManageEvents();
}

// ── Populate Event Dropdowns ──
function populateEventDropdowns() {
    const dropdowns = ['attendance-event', 'cert-event', 'email-event'];
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Select an event --</option>';

        adminEvents.forEach(event => {
            const status = getEventStatus(event);
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} (${status})`;
            select.appendChild(option);
        });

        if (currentVal) select.value = currentVal;
    });
}

// ══════════════════════════════════════════════
// ── ATTENDANCE UPLOAD ──
// ══════════════════════════════════════════════

function onAttendanceEventChange() {
    const eventId = document.getElementById('attendance-event').value;
    const uploadStep = document.getElementById('upload-step');
    const previewStep = document.getElementById('preview-step');

    if (eventId) {
        uploadStep.style.display = 'block';
    } else {
        uploadStep.style.display = 'none';
        previewStep.style.display = 'none';
    }
    parsedAttendees = [];
}

// ── Handle File Upload ──
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
        parseCSV(file);
    } else if (ext === 'pdf') {
        // For PDF, we simulate extraction
        simulatePDFParse(file);
    } else {
        showToast('Please upload a CSV or PDF file', 'error');
    }
}

// ── Parse CSV ──
function parseCSV(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length < 2) {
            showToast('CSV file is empty or has no data rows', 'error');
            return;
        }

        // Parse header
        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nameIdx = header.findIndex(h => h.includes('name'));
        const emailIdx = header.findIndex(h => h.includes('email'));

        if (nameIdx === -1 || emailIdx === -1) {
            showToast('CSV must have "name" and "email" columns', 'error');
            return;
        }

        parsedAttendees = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            if (cols[nameIdx] && cols[emailIdx]) {
                parsedAttendees.push({
                    name: cols[nameIdx],
                    email: cols[emailIdx],
                    status: 'present'
                });
            }
        }

        showAttendeePreview();
        showToast(`Parsed ${parsedAttendees.length} attendees from CSV`, 'success');
    };
    reader.readAsText(file);
}

// ── Simulate PDF Parse ──
function simulatePDFParse(file) {
    showToast('Extracting attendees from PDF...', 'info');

    // Simulate extraction with sample data
    setTimeout(() => {
        parsedAttendees = [
            { name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', status: 'present' },
            { name: 'Priya Patel', email: 'priya.patel@college.edu', status: 'present' },
            { name: 'Rohit Kumar', email: 'rohit.kumar@college.edu', status: 'present' },
            { name: 'Sneha Gupta', email: 'sneha.gupta@college.edu', status: 'present' },
            { name: 'Vikram Singh', email: 'vikram.singh@college.edu', status: 'present' },
            { name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', status: 'present' },
            { name: 'Arjun Nair', email: 'arjun.nair@college.edu', status: 'present' },
            { name: 'Divya Joshi', email: 'divya.joshi@college.edu', status: 'present' },
        ];
        showAttendeePreview();
        showToast(`Extracted ${parsedAttendees.length} attendees from PDF`, 'success');
    }, 1500);
}

// ── Show Attendee Preview ──
function showAttendeePreview() {
    const previewStep = document.getElementById('preview-step');
    previewStep.style.display = 'block';
    document.getElementById('attendee-count').textContent = parsedAttendees.length;

    const tbody = document.getElementById('attendee-preview-tbody');
    tbody.innerHTML = parsedAttendees.map((att, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="font-weight:500;">${att.name}</td>
            <td>${att.email}</td>
            <td><span class="badge badge-success">✅ Present</span></td>
        </tr>
    `).join('');
}

// ── Confirm Attendance ──
function confirmAttendance() {
    const eventId = parseInt(document.getElementById('attendance-event').value);
    if (!eventId || parsedAttendees.length === 0) {
        showToast('No attendees to confirm', 'error');
        return;
    }

    let attendance = JSON.parse(localStorage.getItem('eventcert_attendance') || '{}');
    attendance[eventId] = parsedAttendees;
    localStorage.setItem('eventcert_attendance', JSON.stringify(attendance));

    showToast(`Attendance confirmed for ${parsedAttendees.length} students! ✅`, 'success');

    // Reset UI
    document.getElementById('attendance-file').value = '';
    document.getElementById('preview-step').style.display = 'none';
    parsedAttendees = [];
}

// ── Drag & Drop Support ──
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('attendance-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(event => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('attendance-file');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileUpload(input);
        }
    });
});

// ══════════════════════════════════════════════
// ── CERTIFICATE GENERATION ──
// ══════════════════════════════════════════════

function loadCertEventAttendees() {
    const eventId = parseInt(document.getElementById('cert-event').value);
    const infoDiv = document.getElementById('cert-attendees-info');
    const generateBtn = document.getElementById('generate-certs-btn');

    if (!eventId) {
        infoDiv.style.display = 'none';
        generateBtn.disabled = true;
        return;
    }

    const attendance = JSON.parse(localStorage.getItem('eventcert_attendance') || '{}');
    const attendees = attendance[eventId] || [];

    infoDiv.style.display = 'block';
    document.getElementById('cert-attendees-count').textContent = attendees.length;

    if (attendees.length > 0) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
        showToast('No attendance data found for this event. Please upload attendance first.', 'warning');
    }
}

function generateCertificates() {
    const eventId = parseInt(document.getElementById('cert-event').value);
    if (!eventId) return;

    const event = adminEvents.find(e => e.id === eventId);
    if (!event) return;

    const attendance = JSON.parse(localStorage.getItem('eventcert_attendance') || '{}');
    const attendees = attendance[eventId] || [];

    if (attendees.length === 0) {
        showToast('No attendees found. Upload attendance first.', 'error');
        return;
    }

    let certificates = JSON.parse(localStorage.getItem('eventcert_certificates') || '[]');

    // Remove existing certs for this event (regenerate)
    certificates = certificates.filter(c => c.event_id !== eventId);

    const newCerts = attendees.map((att, i) => ({
        id: Date.now() + i,
        user_id: null, // Will match by email when user logs in
        user_name: att.name,
        user_email: att.email,
        event_id: eventId,
        event_title: event.title,
        certificate_url: `certificates/${eventId}_${att.email.split('@')[0]}.pdf`,
        issued_at: new Date().toISOString(),
        email_sent: false
    }));

    certificates.push(...newCerts);
    localStorage.setItem('eventcert_certificates', JSON.stringify(certificates));

    // Show preview
    document.getElementById('cert-preview-container').style.display = 'block';
    document.getElementById('cert-preview-name').textContent = attendees[0].name;
    document.getElementById('cert-preview-event').textContent = event.title;
    document.getElementById('cert-preview-date').textContent = `Issued on ${formatDate(new Date().toISOString())}`;

    // Show generated list
    const listDiv = document.getElementById('generated-certs-list');
    listDiv.style.display = 'block';

    const tbody = document.getElementById('generated-certs-tbody');
    tbody.innerHTML = newCerts.map((cert, i) => `
        <tr class="animate-in" style="animation-delay:${i * 0.05}s;">
            <td>${i + 1}</td>
            <td style="font-weight:500;">${cert.user_name}</td>
            <td>${cert.user_email}</td>
            <td>${cert.event_title}</td>
            <td><span class="badge badge-success">✅ Generated</span></td>
        </tr>
    `).join('');

    loadAdminData();
    showToast(`🏆 ${newCerts.length} certificates generated successfully!`, 'success');
}

// ══════════════════════════════════════════════
// ── EMAIL SENDING ──
// ══════════════════════════════════════════════

function loadEmailEventCerts() {
    const eventId = parseInt(document.getElementById('email-event').value);
    const infoDiv = document.getElementById('email-certs-info');

    if (!eventId) {
        infoDiv.style.display = 'none';
        return;
    }

    const certs = allCertificates.filter(c => c.event_id === eventId && !c.email_sent);
    infoDiv.style.display = 'block';
    document.getElementById('email-certs-count').textContent = certs.length;

    if (certs.length === 0) {
        document.getElementById('send-emails-btn').disabled = true;
        document.getElementById('send-emails-btn').textContent = 'No certificates to send';
    } else {
        document.getElementById('send-emails-btn').disabled = false;
        document.getElementById('send-emails-btn').textContent = `📧 Send ${certs.length} Certificates`;
    }
}

async function sendCertificateEmails() {
    const eventId = parseInt(document.getElementById('email-event').value);
    if (!eventId) return;

    let certificates = JSON.parse(localStorage.getItem('eventcert_certificates') || '[]');
    const certs = certificates.filter(c => c.event_id === eventId && !c.email_sent);

    if (certs.length === 0) {
        showToast('No unsent certificates found', 'warning');
        return;
    }

    // Show progress
    const progressContainer = document.getElementById('email-progress-container');
    const progressBar = document.getElementById('email-progress-bar');
    const progressText = document.getElementById('email-progress-text');
    const sendBtn = document.getElementById('send-emails-btn');
    const logContainer = document.getElementById('email-log-container');
    const logTbody = document.getElementById('email-log-tbody');

    progressContainer.style.display = 'block';
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner"></span> Sending...';
    logContainer.style.display = 'block';
    logTbody.innerHTML = '';

    for (let i = 0; i < certs.length; i++) {
        const cert = certs[i];

        // Simulate sending email (with delay for visual effect)
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

        // Mark as sent
        const certIndex = certificates.findIndex(c => c.id === cert.id);
        if (certIndex !== -1) {
            certificates[certIndex].email_sent = true;
            certificates[certIndex].email_sent_at = new Date().toISOString();
        }

        // Update progress
        const progress = ((i + 1) / certs.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${i + 1}/${certs.length}`;

        // Add to log
        const row = document.createElement('tr');
        row.className = 'animate-in';
        row.innerHTML = `
            <td style="font-weight:500;">${cert.user_name}</td>
            <td>${cert.user_email}</td>
            <td><span class="badge badge-success">✅ Sent</span></td>
            <td style="color:var(--text-muted);">${formatDateTime(new Date().toISOString())}</td>
        `;
        logTbody.appendChild(row);

        emailsSent++;
    }

    localStorage.setItem('eventcert_certificates', JSON.stringify(certificates));
    localStorage.setItem('eventcert_emails_sent', emailsSent.toString());

    sendBtn.innerHTML = '✅ All Emails Sent!';
    showToast(`📧 Successfully sent ${certs.length} certificates via email!`, 'success');

    loadAdminData();
}
