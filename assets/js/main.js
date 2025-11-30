document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLoader();
    fetchStatus();
    initPushNotifications();
    initParticles();
});

function initParticles() {
    const container = document.createElement('div');
    container.id = 'particles';
    document.body.appendChild(container);

    for (let i = 0; i < 20; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100 + 100}%`; // Start below

    const duration = Math.random() * 20 + 10;
    particle.style.animationDuration = `${duration}s`;

    container.appendChild(particle);

    // Reset after animation
    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, duration * 1000);
}

/* --- Push Notifications --- */
async function initPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push messaging not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');

        // Check permission
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
        }

        if (Notification.permission === 'granted') {
            subscribeUser(registration);
        }
    } catch (error) {
        console.error('Service Worker error', error);
    }
}

async function subscribeUser(registration) {
    try {
        // Get Public Key
        const res = await fetch('/.netlify/functions/pushNotifications');
        const { publicKey } = await res.json();

        if (!publicKey) return;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // Send to backend
        await fetch('/.netlify/functions/pushNotifications', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Subscribed to push notifications');
    } catch (error) {
        console.error('Failed to subscribe', error);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


/* --- Theme System --- */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateToggleIcon(savedTheme);
    } else {
        const systemTheme = prefersDark.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateToggleIcon(systemTheme);
    }

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });

    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateToggleIcon(newTheme);
        }
    });
}

function updateToggleIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* --- Loader System --- */
function initLoader() {
    const loader = document.getElementById('loader');
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Show loader if first visit or > 24h since last visit
    if (!lastVisit || (now - lastVisit > oneDay)) {
        // Simulate loading time
        setTimeout(() => {
            loader.classList.add('hidden');
            localStorage.setItem('lastVisit', now);
        }, 2000);
    } else {
        loader.classList.add('hidden');
    }
}

/* --- Status System --- */
async function fetchStatus() {
    try {
        const response = await fetch('/.netlify/functions/status');
        if (!response.ok) throw new Error('Failed to fetch status');

        const data = await response.json();
        renderStatus(data);
    } catch (error) {
        console.error('Error fetching status:', error);
        // Fallback/Initial State
        renderStatus({
            text: 'Status nicht verfügbar',
            color: 'gray',
            icon: 'fa-question',
            step: 0
        });
    }
}

function renderStatus(data) {
    const statusText = document.getElementById('status-text');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon-inner');
    const progressBar = document.getElementById('progress-fill');
    const steps = document.querySelectorAll('.step');

    // Update Text & Color
    statusText.textContent = 'Aktueller Status';
    statusMessage.textContent = data.text || 'Laden...';

    // Update Icon (assuming FontAwesome)
    statusIcon.className = `fas ${data.icon || 'fa-circle-notch'}`;

    // Update Colors based on status
    let colorVar = 'var(--status-gray)';
    if (data.color === 'blue') colorVar = 'var(--status-blue)';
    if (data.color === 'yellow') colorVar = 'var(--status-yellow)';
    if (data.color === 'green') colorVar = 'var(--status-green)';
    if (data.color === 'red') colorVar = 'var(--status-red)';

    statusIcon.style.color = colorVar;

    // Update Progress
    const totalSteps = steps.length;
    const currentStep = data.step || 0; // 0 to totalSteps-1

    const percentage = (currentStep / (totalSteps - 1)) * 100;
    progressBar.style.width = `${percentage}%`;

    // Update Steps Active State
    steps.forEach((step, index) => {
        if (index <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}
