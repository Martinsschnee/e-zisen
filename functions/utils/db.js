const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'site-data';
const SITE_ID = '92bdccb1-6cc8-4e27-ade2-5f37896ff523'; // User provided ID

// Helper to get the store instance
function getDB() {
    return getStore({
        name: STORE_NAME,
        siteID: SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN // You MUST set this env var in Netlify
    });
}

// Status Methods
async function getStatus() {
    const store = getDB();
    const status = await store.get('status', { type: 'json' });
    return status || {
        text: 'No status set',
        color: 'gray',
        icon: 'fa-question',
        step: 0,
        updatedAt: new Date().toISOString()
    };
}

async function updateStatus(newStatus) {
    const store = getDB();
    const status = {
        ...newStatus,
        updatedAt: new Date().toISOString()
    };
    await store.set('status', JSON.stringify(status));

    // Add to history
    await addToHistory(status);

    return status;
}

// History Methods
async function addToHistory(status) {
    const store = getDB();
    let history = await store.get('history', { type: 'json' }) || [];

    // Keep last 50 entries
    history.unshift(status);
    if (history.length > 50) history.pop();

    await store.set('history', JSON.stringify(history));
}

async function getHistory() {
    const store = getDB();
    return await store.get('history', { type: 'json' }) || [];
}

module.exports = {
    getStatus,
    updateStatus,
    getHistory
};
