const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login submit
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    const user = result.rows[0];

    if (!user) return res.redirect('/login');

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) return res.redirect('/login');

    req.session.userId = user.id;
    req.session.role = user.role;

    res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;