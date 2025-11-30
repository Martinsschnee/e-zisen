const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { sessionId, events } = JSON.parse(event.body);
        const store = getStore('replay');

        await store.set(`session:${sessionId}`, JSON.stringify(events));

        return { statusCode: 200, body: 'saved' };
    } catch (error) {
        return { statusCode: 500, body: 'Error' };
    }
};
