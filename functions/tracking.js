const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const store = getStore('analytics');

        // 1. Live Visitors (Ping)
        if (data.type === 'ping') {
            const now = Date.now();
            await store.set(`visitor:${context.requestId}`, JSON.stringify({ timestamp: now }), { ttl: 30 }); // 30s TTL
            return { statusCode: 200, body: 'pong' };
        }

        // 2. Visit Record
        if (data.type === 'visit') {
            const date = new Date().toISOString().split('T')[0];
            const key = `visits:${date}`;

            // Simple counter
            let current = await store.get(key, { type: 'json' }) || { count: 0 };
            current.count++;
            await store.set(key, JSON.stringify(current));

            // Store IP in a separate list (Recent Visitors)
            const ip = event.headers['client-ip'] || 'Unknown';
            const recentKey = 'recent_visitors';
            let recent = await store.get(recentKey, { type: 'json' }) || [];

            // Add new visit
            recent.unshift({
                ip: ip,
                timestamp: Date.now(),
                userAgent: event.headers['user-agent']
            });

            // Keep last 50
            if (recent.length > 50) recent = recent.slice(0, 50);
            await store.set(recentKey, JSON.stringify(recent));

            return { statusCode: 200, body: 'recorded' };
        }

        return { statusCode: 400, body: 'Unknown type' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Error' };
    }
};
