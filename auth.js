const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            showAlert('Gagal melakukan registrasi. Silakan coba lagi.');
            return res.redirect('/auth/register');
        }
        res.redirect('/auth/login');
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) {
            showAlert('Terjadi kesalahan, silakan coba lagi.');
            return res.redirect('/auth/login');
        }

        if (result.length > 0) {
            const user = result[0];

            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                return res.redirect('/auth/profile');
            } else {
                showAlert('Password salah, silakan coba lagi.');
                return res.redirect('/auth/login');
            }
        } else {
            showAlert('User tidak ditemukan.');
            return res.redirect('/auth/login');
        }
    });
});

router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
