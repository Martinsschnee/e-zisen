const webpush = require('web-push');
const { getStore } = require('@netlify/blobs');

// VAPID Keys should be in env vars
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

exports.handler = async (event, context) => {
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({ publicKey: publicVapidKey })
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            const subscription = JSON.parse(event.body);
            const store = getStore('subscriptions');

            // Save subscription
            // Use endpoint as key to avoid duplicates
            const key = Buffer.from(subscription.endpoint).toString('base64');
            await store.set(key, JSON.stringify(subscription));

            return { statusCode: 201, body: JSON.stringify({ success: true }) };
        } catch (error) {
            console.error(error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to subscribe' }) };
        }
    }

    // Trigger Push (Internal/Admin use only - usually called by status update)
    // For this demo, we'll assume status.js calls a separate logic or we expose a trigger endpoint protected by auth

    return { statusCode: 405, body: 'Method Not Allowed' };
};
