const express = require('express');
const router = express.Router();
const { register, login, logout, refresh, getMe, updateProfile, verifyEmail } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../lib/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);

module.exports = router;
