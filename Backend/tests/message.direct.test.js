/**
 * tests/message.direct.test.js
 * Coverage for direct (1-to-1) message APIs:
 *   POST /api/message/send/:id
 *   GET  /api/message/get/:id
 */
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").default;
const User = require("../models/user.model").default;
const Message = require("../models/message.model").default;
const Conversation = require("../models/conversation.model").default;
const { authCookie, generateTestToken } = require("./setup");

// ── helpers ────────────────────────────────────────────────────────────────
let emailIdx = 0;
const uid = () => `dm_${Date.now()}_${++emailIdx}@letsTalk.test`;

const makeUser = async (name = "DM User") => {
  const email = uid();
  const res = await request(app).post("/api/user/signup").send({
    name,
    email,
    password: "TestPass123!",
    confirmPassword: "TestPass123!",
  });
  return res.body.user; // { _id, name, email }
};

// ── cleanup ────────────────────────────────────────────────────────────────
afterAll(async () => {
  await Message.deleteMany({ message: /^DM test/ });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await Conversation.deleteMany({});
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Message API — POST /api/message/send/:id", () => {
  let sender, receiver;

  beforeAll(async () => {
    sender = await makeUser("Sender");
    receiver = await makeUser("Receiver");
  });

  test("✅ sends a message and returns it", async () => {
    const res = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Cookie", authCookie(sender._id))
      .send({ message: "DM test hello!" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.message).toBe("DM test hello!");
    expect(res.body.senderId).toBe(sender._id);
    expect(res.body.receiverId).toBe(receiver._id);
  });

  test("✅ creates a conversation on first message", async () => {
    const s = await makeUser("SenderNew");
    const r = await makeUser("ReceiverNew");

    await request(app)
      .post(`/api/message/send/${r._id}`)
      .set("Cookie", authCookie(s._id))
      .send({ message: "DM test first" });

    const conv = await Conversation.findOne({
      members: { $all: [s._id, r._id] },
    });
    expect(conv).not.toBeNull();
    expect(conv.messages.length).toBeGreaterThanOrEqual(1);
  });

  test("✅ subsequent messages append to same conversation", async () => {
    const s = await makeUser("SenderRepeat");
    const r = await makeUser("ReceiverRepeat");

    await request(app)
      .post(`/api/message/send/${r._id}`)
      .set("Cookie", authCookie(s._id))
      .send({ message: "DM test msg 1" });

    await request(app)
      .post(`/api/message/send/${r._id}`)
      .set("Cookie", authCookie(s._id))
      .send({ message: "DM test msg 2" });

    const conv = await Conversation.findOne({
      members: { $all: [s._id, r._id] },
    });
    expect(conv.messages.length).toBe(2);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .send({ message: "DM test unauthorized" });

    expect(res.status).toBe(401);
  });

  test("❌ returns 500 when message body is missing", async () => {
    const res = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Cookie", authCookie(sender._id))
      .send({});

    // message field is required in schema → Mongoose validation error → 500
    expect([400, 500]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Message API — GET /api/message/get/:id", () => {
  let userA, userB;

  beforeAll(async () => {
    userA = await makeUser("GetterA");
    userB = await makeUser("GetterB");
  });

  test("✅ returns empty array when no conversation exists", async () => {
    const res = await request(app)
      .get(`/api/message/get/${userB._id}`)
      .set("Cookie", authCookie(userA._id));

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("✅ returns messages after sending", async () => {
    // Send two messages
    await request(app)
      .post(`/api/message/send/${userB._id}`)
      .set("Cookie", authCookie(userA._id))
      .send({ message: "DM test first get" });

    await request(app)
      .post(`/api/message/send/${userB._id}`)
      .set("Cookie", authCookie(userA._id))
      .send({ message: "DM test second get" });

    const res = await request(app)
      .get(`/api/message/get/${userB._id}`)
      .set("Cookie", authCookie(userA._id));

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  test("✅ messages are accessible from receiver's perspective too", async () => {
    const res = await request(app)
      .get(`/api/message/get/${userA._id}`)
      .set("Cookie", authCookie(userB._id));

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).get(`/api/message/get/${userB._id}`);
    expect(res.status).toBe(401);
  });
});
