const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        req.user = null;
        return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        req.user = null;
        return next();
    }

    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Find user in DB
        const user = await User.findById(payload.id).lean();
        if (!user) {
            req.user = null;
        } else {
            const roleFromToken = typeof payload?.role === 'string' ? payload.role : null;
            const effectiveRole = user.role || roleFromToken || 'user';
            if (!user.role && roleFromToken && roleFromToken !== 'user') {
                User.updateOne({ _id: user._id }, { $set: { role: roleFromToken } }).catch(() => {});
            }
            req.user = { id: user._id.toString(), email: user.email, name: user.name || null, role: effectiveRole };
        }
    } catch (err) {
        req.user = null;
    }

    return next();
}

module.exports = authMiddleware;
