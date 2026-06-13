/**
 * tests/message.group.test.js  (complete rewrite)
 * Coverage: POST /api/message/group/send/:groupId
 */
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").default;
const User = require("../models/user.model").default;
const Group = require("../models/group.model").default;
const GroupMember = require("../models/groupMember.model").default;
const Conversation = require("../models/conversation.model").default;
const Message = require("../models/message.model").default;
const { authCookie } = require("./setup");

let idx = 0;
const uid = () => `mgt_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async (name = "MsgGroup User") => {
  const res = await request(app).post("/api/user/signup").send({
    name,
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

const createGroup = async (userId, name = "MGT Test Group") =>
  (
    await request(app)
      .post("/api/group/create")
      .set("Cookie", authCookie(userId))
      .send({ name })
  ).body.group;

afterAll(async () => {
  await Group.deleteMany({ name: /^MGT Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await Message.deleteMany({ message: /^MGT test/ });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Message API — POST /api/message/group/send/:groupId", () => {
  let admin, group;

  beforeAll(async () => {
    admin = await makeUser("MGT Admin");
    group = await createGroup(admin._id, "MGT Test SendGroup");
  });

  // ── Happy paths ──────────────────────────────────────────────────────────
  test("✅ group member can send a message", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "MGT test hello group!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toHaveProperty("_id");
    expect(res.body.message.message).toBe("MGT test hello group!");
  });

  test("✅ response message has populated senderId", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "MGT test populated sender" });

    expect(res.status).toBe(201);
    expect(res.body.message.senderId).toHaveProperty("name");
    expect(res.body.message.senderId).toHaveProperty("email");
    expect(res.body.message.senderId).not.toHaveProperty("password");
  });

  test("✅ message is stored with correct groupId", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "MGT test groupId check" });

    expect(res.status).toBe(201);
    const msgId = res.body.message._id;
    const dbMsg = await Message.findById(msgId);
    expect(dbMsg.groupId.toString()).toBe(group._id);
  });

  test("✅ message is appended to group conversation", async () => {
    await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "MGT test conv check" });

    const conv = await Conversation.findOne({ groupId: group._id });
    expect(conv).not.toBeNull();
    expect(conv.messages.length).toBeGreaterThanOrEqual(1);
  });

  test("✅ a non-admin member can also send messages", async () => {
    const member = await makeUser("MGT Regular Member");
    await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(admin._id))
      .send({ userId: member._id });

    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(member._id))
      .send({ message: "MGT test member sends" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("✅ message text is trimmed", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "  MGT test trimmed  " });

    expect(res.status).toBe(201);
    expect(res.body.message.message).toBe("MGT test trimmed");
  });

  // ── Error paths ──────────────────────────────────────────────────────────
  test("❌ non-member cannot send to group", async () => {
    const outsider = await makeUser("MGT Outsider");
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(outsider._id))
      .send({ message: "MGT test unauthorized send" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not a member/i);
  });

  test("❌ empty message is rejected", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/empty/i);
  });

  test("❌ missing message body is rejected", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .set("Cookie", authCookie(admin._id))
      .send({});

    expect([400, 500]).toContain(res.status);
  });

  test("❌ returns 404 for non-existent group", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/message/group/send/${fakeId}`)
      .set("Cookie", authCookie(admin._id))
      .send({ message: "MGT test ghost group" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app)
      .post(`/api/message/group/send/${group._id}`)
      .send({ message: "MGT test no auth" });

    expect(res.status).toBe(401);
  });
});
