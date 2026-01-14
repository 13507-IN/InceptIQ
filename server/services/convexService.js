const fetch = require('node-fetch');

/**
 * Optional Convex integration helper.
 * This will only attempt to send data to Convex if CONVEX_ENDPOINT and CONVEX_KEY are set.
 * The implementation assumes the user has set up an HTTP endpoint that accepts POST requests
 * to ingest records into Convex (since Convex SDKs are environment-specific).
 */
class ConvexService {
    constructor() {
        this.endpoint = process.env.CONVEX_ENDPOINT || null;
        this.key = process.env.CONVEX_KEY || null;
    }

    isEnabled() {
        return !!(this.endpoint && this.key);
    }

    async saveUserRequest(userId, summary) {
        if (!this.isEnabled()) return null;

        try {
            const resp = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.key}`
                },
                body: JSON.stringify({ userId, summary })
            });

            if (!resp.ok) {
                const text = await resp.text();
                console.warn('Convex saveUserRequest failed:', resp.status, text);
                return null;
            }

            const data = await resp.json();
            return data;
        } catch (err) {
            console.warn('Convex service error:', err.message || err);
            return null;
        }
    }
}

module.exports = new ConvexService();
