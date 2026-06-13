/**
 * tests/setup.js — Shared test helpers
 *
 * Fixes:
 *  - Uses JWT_TOKEN (matching secureRoute.js & generateToken.js)
 *  - Auth cookie helper (secureRoute reads req.cookies.jwt — NOT Authorization header)
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load real .env so JWT_TOKEN and MONGODB_URI are available
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_TOKEN || "test-jwt-secret-fallback";

// ── Factories ──────────────────────────────────────────────────────────────

const createTestUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: "Test User",
  email: `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
  password: "hashedPassword123",
  ...overrides,
});

const createTestGroup = (creatorId, overrides = {}) => {
  const uid = creatorId || new mongoose.Types.ObjectId();
  return {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Group",
    description: "Test Group Description",
    avatar: "G",
    createdBy: uid,
    members: [{ userId: uid, role: "admin", joinedAt: new Date() }],
    isActive: true,
    ...overrides,
  };
};

// ── Token / Cookie helpers ─────────────────────────────────────────────────

/**
 * Generate a signed JWT (using the real JWT_TOKEN secret so secureRoute accepts it).
 */
const generateTestToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

/**
 * Return a cookie string that secureRoute.js can read.
 * Usage:  request(app).get("/api/...").set("Cookie", authCookie(userId))
 */
const authCookie = (userId) => `jwt=${generateTestToken(userId)}`;

// ── Pre-built helpers ──────────────────────────────────────────────────────

const authUser = createTestUser();
const authToken = generateTestToken(authUser._id);

module.exports = {
  createTestUser,
  createTestGroup,
  generateTestToken,
  authCookie,
  authUser,
  authToken,
  JWT_SECRET,
};
