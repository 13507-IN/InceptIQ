const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const ALLOWED_ROLES = ['user', 'investor'];
const normalizeRole = (value) => {
    if (!value) return null;
    const normalized = String(value).trim().toLowerCase();
    return ALLOWED_ROLES.includes(normalized) ? normalized : null;
};

const withForcedRole = (role) => (req, _res, next) => {
    if (!req.body || typeof req.body !== 'object') req.body = {};
    req.body.role = role;
    next();
};

const handleSignup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

        const requestedRole = normalizeRole(req.body?.role);
        if (req.body?.role && !requestedRole) {
            return res.status(400).json({ error: 'Invalid role', message: 'Role must be user or investor' });
        }
        const role = requestedRole || 'user';

        const existing = await User.findOne({ email });
        if (existing) {
            const existingRole = existing.role || 'user';
            if (requestedRole && existingRole !== requestedRole) {
                return res.status(409).json({
                    error: 'User already exists',
                    message: `Account is already registered as ${existingRole}. Please use the correct login portal.`
                });
            }
            return res.status(409).json({ error: 'User already exists' });
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ _id: id, name: name || undefined, email, passwordHash, role, createdAt: new Date().toISOString() });
        await user.save();

        const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({ success: true, token, user: { id: user._id.toString(), name: user.name || null, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Signup failed:', err);
        res.status(500).json({ error: 'Signup failed', message: err.message || String(err) });
    }
};

// Signup
router.post('/signup', handleSignup);
router.post('/investor/signup', withForcedRole('investor'), handleSignup);

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

        const requestedRole = normalizeRole(req.body?.role);
        if (req.body?.role && !requestedRole) {
            return res.status(400).json({ error: 'Invalid role', message: 'Role must be user or investor' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.role && requestedRole) {
            user.role = requestedRole;
            await user.save();
        }

        const userRole = user.role || 'user';
        if (requestedRole && userRole !== requestedRole) {
            return res.status(403).json({
                error: 'Role mismatch',
                message: `Account is registered as ${userRole}. Please use the correct login portal.`
            });
        }

        const token = jwt.sign({ id: user._id.toString(), email: user.email, role: userRole }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({ success: true, token, user: { id: user._id.toString(), name: user.name || null, email: user.email, role: userRole } });
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ error: 'Login failed', message: err.message || String(err) });
    }
};

// Login
router.post('/login', handleLogin);
router.post('/investor/login', withForcedRole('investor'), handleLogin);

// Get current user
router.get('/me', (req, res) => {
    // Expect auth middleware to have set req.user
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ success: true, user: req.user });
});

// Get user's saved requests (requires auth middleware to set req.user)
router.get('/requests', async (req, res) => {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('📋 FETCH USER REQUESTS');
        console.log('User ID:', req.user?.id);
        console.log('User Email:', req.user?.email);
        
        if (!req.user) {
            console.error('❌ Not authenticated');
            console.log('='.repeat(60) + '\n');
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        console.log(`🔍 Looking up user with ID: ${req.user.id}`);
        const user = await User.findById(req.user.id).lean();
        
        if (!user) {
            console.error(`❌ User not found in database`);
            console.log('='.repeat(60) + '\n');
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log(`✅ User found. Requests count: ${user.requests?.length || 0}`);
        if (user.requests && user.requests.length > 0) {
            console.log('📝 Requests:');
            user.requests.forEach((req, idx) => {
                console.log(`   ${idx + 1}. ${req.input?.ideaTitle || 'Unknown'} - ${req.createdAt}`);
            });
        } else {
            console.log('⚠️  No requests found for this user');
        }
        
        console.log('='.repeat(60) + '\n');
        res.json({ success: true, requests: user.requests || [] });
    } catch (err) {
        console.error('❌ Failed to get user requests:', err);
        console.error('Stack:', err.stack);
        console.log('='.repeat(60) + '\n');
        res.status(500).json({ error: 'Failed to retrieve requests' });
    }
});

module.exports = router;
