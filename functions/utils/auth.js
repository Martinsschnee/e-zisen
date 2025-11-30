const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

function getUser(headers) {
    // Normalize headers keys to lowercase just in case
    const normalizedHeaders = {};
    for (const key in headers) {
        normalizedHeaders[key.toLowerCase()] = headers[key];
    }

    const cookies = cookie.parse(normalizedHeaders.cookie || '');
    const token = cookies.auth_token;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

function createToken(user) {
    return jwt.sign(user, SECRET, { expiresIn: '1h' });
}

module.exports = {
    getUser,
    createToken,
    SECRET
};
