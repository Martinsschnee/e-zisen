const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const errorData = JSON.parse(event.body);
        const store = getStore('errors');

        const id = Date.now().toString();
        await store.set(`error:${id}`, JSON.stringify({
            ...errorData,
            timestamp: new Date().toISOString(),
            ip: event.headers['client-ip']
        }));

        return { statusCode: 200, body: 'logged' };
    } catch (error) {
        return { statusCode: 500, body: 'Error' };
    }
};
