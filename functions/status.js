const { getStatus, updateStatus } = require('./utils/db');
const { getUser } = require('./utils/auth');

exports.handler = async (event, context) => {
    // GET: Public access
    if (event.httpMethod === 'GET') {
        try {
            const status = await getStatus();
            return {
                statusCode: 200,
                body: JSON.stringify(status)
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch status' })
            };
        }
    }

    // POST: Admin only
    if (event.httpMethod === 'POST') {
        const user = getUser(event.headers);
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        try {
            const newStatus = JSON.parse(event.body);
            // Validate input
            if (!newStatus.text || !newStatus.color) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Missing required fields' })
                };
            }

            const updated = await updateStatus(newStatus);

            // Trigger Push Notifications (Async - fire and forget or await)
            // We'll implement this later in pushNotifications.js or call it here if ready.
            // For now, just return success.

            return {
                statusCode: 200,
                body: JSON.stringify(updated)
            };
        } catch (error) {
            console.error(error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Failed to update status: ${error.message}` })
            };
        }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
};
