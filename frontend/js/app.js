/* ============================================
   EventCert — Core Application Logic
   Auth simulation, navigation, toasts, particles
   ============================================ */

// ── Auth Tab Switching ──
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab-btn');
    const registerTab = document.getElementById('register-tab-btn');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

// ── Auth Handlers ──
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Check stored users
    const users = JSON.parse(localStorage.getItem('eventcert_users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        showToast('No account found with this email. Please register first.', 'error');
        return;
    }

    if (user.password !== password) {
        showToast('Incorrect password. Please try again.', 'error');
        return;
    }

    // Set current session
    const session = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        logged_in_at: new Date().toISOString()
    };
    localStorage.setItem('eventcert_session', JSON.stringify(session));

    showToast(`Welcome back, ${user.full_name}! 🎉`, 'success');

    setTimeout(() => {
        if (user.role === 'organizer') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }, 800);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    let users = JSON.parse(localStorage.getItem('eventcert_users') || '[]');

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showToast('An account with this email already exists', 'error');
        return;
    }

    const newUser = {
        id: users.length + 1,
        full_name: name,
        email: email,
        password: password,
        role: role,
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('eventcert_users', JSON.stringify(users));

    // Auto-login
    const session = {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        logged_in_at: new Date().toISOString()
    };
    localStorage.setItem('eventcert_session', JSON.stringify(session));

    showToast(`Account created! Welcome, ${name}! 🎉`, 'success');

    setTimeout(() => {
        if (role === 'organizer') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }, 800);
}

// ── Logout ──
function logout() {
    localStorage.removeItem('eventcert_session');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ── Session Check ──
function getSession() {
    const session = localStorage.getItem('eventcert_session');
    return session ? JSON.parse(session) : null;
}

function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

// ── Toast Notification System ──
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ── Utility: Format Date ──
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ── Utility: Get Initials ──
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Particle Animation (Landing Page only) ──
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1
        };
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push(createParticle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[j].x - p.x;
                const dy = particles[j].y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
    animate();
}

// ── Initialize Mock Data ──
function initMockData() {
    // Only seed if no events exist
    if (localStorage.getItem('eventcert_events')) return;

    const now = new Date();
    const events = [
        {
            id: 1,
            title: "Web Development Bootcamp 2026",
            description: "An intensive 3-day bootcamp covering HTML, CSS, JavaScript, React and Node.js. Hands-on projects, live coding sessions, and expert mentorship.",
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Auditorium Hall A, Main Campus",
            organizer_id: 1,
            organizer_name: "Prof. Sharma",
            created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "upcoming",
            max_attendees: 120,
            category: "Technology"
        },
        {
            id: 2,
            title: "AI & Machine Learning Workshop",
            description: "Explore the fundamentals of artificial intelligence and machine learning with practical demos using Python, TensorFlow, and real-world datasets.",
            date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Computer Lab 3, IT Building",
            organizer_id: 1,
            organizer_name: "Dr. Patel",
            created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "upcoming",
            max_attendees: 80,
            category: "Technology"
        },
        {
            id: 3,
            title: "Cybersecurity Awareness Seminar",
            description: "Learn about the latest cybersecurity threats, best practices for data protection, and hands-on ethical hacking demonstrations.",
            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Seminar Hall B, Block 2",
            organizer_id: 1,
            organizer_name: "Mr. Kulkarni",
            created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: "current",
            max_attendees: 150,
            category: "Security"
        },
        {
            id: 4,
            title: "Cloud Computing Masterclass",
            description: "Deep dive into AWS, Azure, and Google Cloud. Learn to deploy, scale, and manage cloud infrastructure with real-world scenarios.",
            date: new Date(now.getTime()).toISOString(),
            location: "Virtual (Zoom)",
            organizer_id: 1,
            organizer_name: "Ms. Desai",
            created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: "current",
            max_attendees: 200,
            category: "Cloud"
        },
        {
            id: 5,
            title: "Data Science Hackathon",
            description: "A 24-hour hackathon where teams compete to solve real-world data problems. Prizes worth ₹50,000 for the winners!",
            date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Innovation Center, Ground Floor",
            organizer_id: 1,
            organizer_name: "Prof. Sinha",
            created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "upcoming",
            max_attendees: 60,
            category: "Data Science"
        },
        {
            id: 6,
            title: "Mobile App Development Sprint",
            description: "Build cross-platform mobile apps using Flutter and React Native. From zero to app store in just 2 days!",
            date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Lab 101, Tech Block",
            organizer_id: 1,
            organizer_name: "Dr. Mehta",
            created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "upcoming",
            max_attendees: 50,
            category: "Mobile"
        }
    ];

    localStorage.setItem('eventcert_events', JSON.stringify(events));
    localStorage.setItem('eventcert_registrations', JSON.stringify([]));
    localStorage.setItem('eventcert_certificates', JSON.stringify([]));
    localStorage.setItem('eventcert_attendance', JSON.stringify({}));
}

// ── Auto-redirect if logged in (for landing page) ──
function checkLandingRedirect() {
    const session = getSession();
    if (session && window.location.pathname.endsWith('index.html') ||
        session && window.location.pathname.endsWith('/')) {
        // Already logged in, offer redirect
    }
}

// ── Init on DOM Load ──
document.addEventListener('DOMContentLoaded', () => {
    initMockData();
    initParticles();
});
