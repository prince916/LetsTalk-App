/**
 * tests/user.test.js
 * Full coverage of the User API:
 *   POST /api/user/signup
 *   POST /api/user/login
 *   POST /api/user/logout
 *   GET  /api/user/session  (requires auth cookie)
 *   GET  /api/user/allUsers  (requires auth cookie)
 */
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").default;
const User = require("../models/user.model").default;
const { authCookie, generateTestToken } = require("./setup");

// ── Unique email helper to avoid duplicate-key collisions between tests ────
let emailCounter = 0;
const uniqueEmail = () =>
  `user_test_${Date.now()}_${++emailCounter}@letsTalk.test`;

// ── Global DB lifecycle ────────────────────────────────────────────────────
afterAll(async () => {
  // Clean up only users created by this test file
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("User API — POST /api/user/signup", () => {
  test("✅ creates a new user with valid data", async () => {
    const email = uniqueEmail();
    const res = await request(app).post("/api/user/signup").send({
      name: "Alice",
      email,
      password: "Password123!",
      confirmPassword: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    // User model has lowercase:true — stored email is always lowercase
    expect(res.body.user.email).toBe(email.toLowerCase());
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.message).toMatch(/created/i);
  });

  test("✅ sets a jwt cookie on signup", async () => {
    const res = await request(app).post("/api/user/signup").send({
      name: "Cookie Test",
      email: uniqueEmail(),
      password: "Pass1234!",
      confirmPassword: "Pass1234!",
    });

    expect(res.status).toBe(201);
    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.some((c) => c.startsWith("jwt="))).toBe(true);
  });

  test("✅ returns a public image URL when signup includes a profile picture", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .attach("profilePicture", Buffer.from("fake-image-bytes"), {
        filename: "avatar.png",
        contentType: "image/png",
      })
      .field("name", "Image User")
      .field("email", uniqueEmail())
      .field("password", "Pass1234!")
      .field("confirmPassword", "Pass1234!");

    expect(res.status).toBe(201);
    expect(res.body.user.profilePicture).toMatch(/^https?:\/\//i);
    expect(res.body.user.profilePicture).toContain("/uploads/profiles/");
  });

  test("❌ fails when passwords do not match", async () => {
    const res = await request(app).post("/api/user/signup").send({
      name: "Bob",
      email: uniqueEmail(),
      password: "Password123!",
      confirmPassword: "WrongPassword",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/do not match/i);
  });

  test("❌ fails when email is already registered", async () => {
    const email = uniqueEmail();
    // First signup
    await request(app).post("/api/user/signup").send({
      name: "First",
      email,
      password: "Pass123!",
      confirmPassword: "Pass123!",
    });
    // Duplicate
    const res = await request(app).post("/api/user/signup").send({
      name: "Second",
      email,
      password: "Pass123!",
      confirmPassword: "Pass123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already registered/i);
  });

  test("❌ fails when name is missing", async () => {
    const res = await request(app).post("/api/user/signup").send({
      email: uniqueEmail(),
      password: "Pass123!",
      confirmPassword: "Pass123!",
    });

    // Mongoose required validation → 500 or 400
    expect([400, 500]).toContain(res.status);
  });

  test("❌ fails when email is missing", async () => {
    const res = await request(app).post("/api/user/signup").send({
      name: "NoEmail",
      password: "Pass123!",
      confirmPassword: "Pass123!",
    });

    expect([400, 500]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("User API — POST /api/user/login", () => {
  const loginEmail = `login_test_${Date.now()}@letsTalk.test`;
  const loginPassword = "LoginPass123!";

  // Create a real user to log in with
  beforeAll(async () => {
    await request(app).post("/api/user/signup").send({
      name: "Login Test User",
      email: loginEmail,
      password: loginPassword,
      confirmPassword: loginPassword,
    });
  });

  test("✅ logs in with correct credentials", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: loginEmail,
      password: loginPassword,
    });

    expect(res.status).toBe(201);
    // User model has lowercase:true — stored email is always lowercase
    expect(res.body.user.email).toBe(loginEmail.toLowerCase());
    expect(res.body).not.toHaveProperty("password");
    // Should set a cookie
    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.some((c) => c.startsWith("jwt="))).toBe(true);
  });

  test("❌ fails with wrong password", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: loginEmail,
      password: "WrongPassword!",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid/i);
  });

  test("❌ fails with non-existent email", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "nobody@nowhere.test",
      password: "Whatever123!",
    });

    expect([400, 500]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("User API — POST /api/user/logout", () => {
  test("✅ clears the jwt cookie on logout", async () => {
    const res = await request(app).post("/api/user/logout");

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/logged out/i);
    // Cookie should be cleared (max-age=0 or expires in past)
    const cookies = res.headers["set-cookie"] || [];
    const jwtCookie = cookies.find((c) => c.startsWith("jwt="));
    if (jwtCookie) {
      expect(jwtCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0|jwt=;/i);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("User API — GET /api/user/session", () => {
  let userId;
  let email;

  beforeAll(async () => {
    email = uniqueEmail();
    const res = await request(app).post("/api/user/signup").send({
      name: "Session User",
      email,
      password: "SessionPass123!",
      confirmPassword: "SessionPass123!",
    });

    userId = res.body.user?._id;
  });

  test("✅ returns the authenticated user session", async () => {
    const res = await request(app)
      .get("/api/user/session")
      .set("Cookie", authCookie(userId));

    expect(res.status).toBe(200);
    expect(res.body.authenticated).toBe(true);
    expect(res.body.user._id).toBe(userId);
    expect(res.body.user.email).toBe(email.toLowerCase());
    expect(res.body.user).not.toHaveProperty("password");
  });

  test("❌ returns 401 when no auth cookie is provided", async () => {
    const res = await request(app).get("/api/user/session");

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("User API — GET /api/user/allUsers", () => {
  let userId;

  beforeAll(async () => {
    const email = uniqueEmail();
    const res = await request(app).post("/api/user/signup").send({
      name: "All Users Tester",
      email,
      password: "TestPass123!",
      confirmPassword: "TestPass123!",
    });
    userId = res.body.user?._id;
  });

  test("✅ returns all other users when authenticated", async () => {
    const res = await request(app)
      .get("/api/user/allUsers")
      .set("Cookie", authCookie(userId));

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    // Logged-in user should not be in the list
    const ids = res.body.map((u) => u._id);
    expect(ids).not.toContain(userId);
    // No passwords leaked
    res.body.forEach((u) => expect(u).not.toHaveProperty("password"));
  });

  test("❌ returns 401 when no auth cookie provided", async () => {
    const res = await request(app).get("/api/user/allUsers");
    expect(res.status).toBe(401);
  });

  test("❌ returns 401 with an invalid jwt cookie", async () => {
    const res = await request(app)
      .get("/api/user/allUsers")
      .set("Cookie", "jwt=totally-invalid-token");
    expect([401, 500]).toContain(res.status);
  });
});
