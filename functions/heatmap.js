const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { x, y, path, type } = JSON.parse(event.body);
        const store = getStore('heatmap');

        // Store as individual events or aggregate
        // For simplicity, we'll just append to a daily log
        const date = new Date().toISOString().split('T')[0];
        const key = `heatmap:${date}`;

        let data = await store.get(key, { type: 'json' }) || [];
        data.push({ x, y, path, type, ts: Date.now() });

        // Limit size
        if (data.length > 1000) data = data.slice(-1000);

        await store.set(key, JSON.stringify(data));

        return { statusCode: 200, body: 'ok' };
    } catch (error) {
        return { statusCode: 500, body: 'Error' };
    }
};
