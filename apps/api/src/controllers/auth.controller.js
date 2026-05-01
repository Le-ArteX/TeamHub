const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../utils/jwt');
const { sendVerificationEmail } = require('../lib/email');

// POST /api/auth/register
async function register(req, res) {
  console.log("📩 [API] REGISTER ATTEMPT RECEIVED:", req.body?.email);
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        verificationToken: verificationToken,
        isVerified: false
      },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        avatarUrl: true, 
        isVerified: true 
      }
    });

    console.log("\n\n" + "🚀".repeat(20));
    console.log(`🔥 VERIFICATION TOKEN FOR ${email}: [ ${verificationToken} ] 🔥`);
    console.log("🚀".repeat(20) + "\n\n");

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Hash the refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken }
    });

    // Send verification email (asynchronous, don't block response)
    sendVerificationEmail(email, name, verificationToken).catch(err => console.error('Email send failed:', err));

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message,
      code: error.code // Prisma error codes are very helpful
    });
  }
}


// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
    }
    clearTokenCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    clearTokenCookies(res);
    res.json({ message: 'Logged out' });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) },
    });

    setTokenCookies(res, accessToken, newRefreshToken);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    clearTokenCookies(res);
    res.status(401).json({ error: 'Token refresh failed' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json({ user: req.user });
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    const { uploadToCloudinary } = require('../lib/cloudinary');

    const data = {};
    if (name) data.name = name;

    // Upload avatar buffer to Cloudinary if a file was provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      data.avatarUrl = result.secure_url;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
}

// GET /api/auth/verify?code=...
async function verifyEmail(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Verification code is required' });

    const user = await prisma.user.findUnique({ where: { verificationToken: code } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    res.json({ message: 'Email verified successfully! You can now access your dashboard.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}

module.exports = { register, login, logout, refresh, getMe, updateProfile, verifyEmail };
