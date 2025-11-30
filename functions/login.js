const { createToken } = require('./utils/auth');
const cookie = require('cookie');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // Simple env var check or fallback
        const validUser = process.env.ADMIN_USER
        const validPass = process.env.ADMIN_PASS

        if (username === validUser && password === validPass) {
            const token = createToken({ username });

            const authCookie = cookie.serialize('auth_token', token, {
                httpOnly: true,
                secure: true, // Always secure in production (Netlify handles SSL)
                sameSite: 'strict',
                maxAge: 3600, // 1 hour
                path: '/'
            });

            return {
                statusCode: 200,
                headers: {
                    'Set-Cookie': authCookie,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request' })
        };
    }
};
