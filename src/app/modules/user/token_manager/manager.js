import jwt from 'jsonwebtoken';

/**
 * @typedef {Object} TokenData
 * @property {string} userId
 * @property {string} role
 * @property {number} exp  // unix timestamp истечения токена
 */

export default class TokenManager {
    constructor(config) {
        this.secretKey = config.jwt.secretKey;
        this.expiresIn = config.jwt.ttl;
    }

    /**
     * Создать токен.
     * @param {string} userId
     * @param {string} role
     * @returns {string}
     */
    createToken(userId, role) {
        if (!userId || !role) {
            throw new Error('TokenManager.createToken: userId and role are required');
        }
        const payload = { userId, role };
        return jwt.sign(payload, this.secretKey, {
            expiresIn: this.expiresIn,
            algorithm: 'HS256',
        });
    }

    /**
     * Проверить токен.
     * @param {string} token
     * @returns {TokenData}
     */
    verifyToken(token) {
        if (!token) {
            throw new Error('TokenManager.verifyToken: token is required');
        }
        try {
            const raw = TokenManager.stripBearer(token);
            const decoded = /** @type {any} */ (jwt.verify(raw, this.secretKey));
            return {
                userId: decoded.userId,
                role: decoded.role,
                exp: decoded.exp,
            };
        } catch (err) {
            throw new Error(`TokenManager.verifyToken: invalid token: ${err.message}`);
        }
    }

    /**
     * @param {string} header
     * @returns {string}
     */
    static stripBearer(header) {
        const s = String(header).trim();
        return s.toLowerCase().startsWith('bearer ')
            ? s.slice(7).trim()
            : s;
    }
}