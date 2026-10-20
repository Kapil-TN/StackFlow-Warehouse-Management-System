const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  await logActivity({
    userId: user._id,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user._id,
    description: `${user.name} logged in`,
  });

  res.json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc   Get current logged in user
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

// @desc   Get all users (admin only)
// @route  GET /api/auth/users
// @access Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json(users);
};

// @desc   Create a user (admin only)
// @route  POST /api/auth/users
// @access Private/Admin
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || "operator",
  });

  await logActivity({
    userId: req.user._id,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user._id,
    description: `Admin created user ${user.name} (${user.role})`,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

// @desc   Update a user (admin only)
// @route  PUT /api/auth/users/:id
// @access Private/Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, role, password } = req.body;

  user.name = name || user.name;
  user.email = email ? email.toLowerCase() : user.email;
  user.role = role || user.role;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updated = await user.save();

  await logActivity({
    userId: req.user._id,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user._id,
    description: `Admin updated user ${updated.name}`,
  });

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  });
};

// @desc   Delete a user (admin only)
// @route  DELETE /api/auth/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own account");
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ message: "User deleted" });
};

module.exports = { login, getMe, getUsers, createUser, updateUser, deleteUser };
