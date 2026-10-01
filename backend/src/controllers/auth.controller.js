const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { PATTERNS, MESSAGES } = require('../utils/validation');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const toAuthResponse = (user) => ({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  },
  token: generateToken(user._id),
});

// @route   POST /api/auth/register  (Public)
// Self-registration always creates a patient; admins are created with seedAdmin.js.
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      res.status(400);
      throw new Error('Name, email, password and phone number are required');
    }
    if (!PATTERNS.password.test(String(password))) {
      res.status(400);
      throw new Error(MESSAGES.password);
    }

    const userExists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (userExists) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'patient',
    });

    res.status(201).json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login  (Public)
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    if (!PATTERNS.email.test(String(email).trim())) {
      res.status(400);
      throw new Error(MESSAGES.email);
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me  (Private)
const getMe = async (req, res) => {
  res.json(req.user);
};

// @route   GET /api/auth/users  (Admin) — registered patients
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'patient' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe, getUsers };
