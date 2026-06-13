/**
 * tests/group.messages.test.js  (complete rewrite)
 * Coverage: GET /api/group/:groupId/messages
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
const uid = () => `gmsg_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async (name = "Msg User") => {
  const res = await request(app).post("/api/user/signup").send({
    name,
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

const createGroup = async (userId, name = "GMsg Test Group") =>
  (
    await request(app)
      .post("/api/group/create")
      .set("Cookie", authCookie(userId))
      .send({ name })
  ).body.group;

const sendGroupMsg = (groupId, userId, msg) =>
  request(app)
    .post(`/api/message/group/send/${groupId}`)
    .set("Cookie", authCookie(userId))
    .send({ message: msg });

afterAll(async () => {
  await Group.deleteMany({ name: /^GMsg Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await Message.deleteMany({ message: /^GMsg test/ });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — GET /api/group/:groupId/messages", () => {
  let admin, group;

  beforeAll(async () => {
    admin = await makeUser("GMsg Admin");
    group = await createGroup(admin._id, "GMsg Test GetMsgs");
  });

  test("✅ returns empty messages array when no messages sent", async () => {
    const freshAdmin = await makeUser("Fresh GMsg Admin");
    const freshGroup = await createGroup(freshAdmin._id, "GMsg Test Empty");

    const res = await request(app)
      .get(`/api/group/${freshGroup._id}/messages`)
      .set("Cookie", authCookie(freshAdmin._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBe(0);
  });

  test("✅ returns messages after sending to group", async () => {
    await sendGroupMsg(group._id, admin._id, "GMsg test message one");
    await sendGroupMsg(group._id, admin._id, "GMsg test message two");

    const res = await request(app)
      .get(`/api/group/${group._id}/messages`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(200);
    expect(res.body.messages.length).toBeGreaterThanOrEqual(2);
  });

  test("✅ messages include populated sender info", async () => {
    await sendGroupMsg(group._id, admin._id, "GMsg test populated msg");

    const res = await request(app)
      .get(`/api/group/${group._id}/messages`)
      .set("Cookie", authCookie(admin._id));

    const msgs = res.body.messages;
    expect(msgs.length).toBeGreaterThan(0);
    const last = msgs[msgs.length - 1];
    expect(last.senderId).toHaveProperty("name");
    expect(last.senderId).toHaveProperty("email");
    expect(last.senderId).not.toHaveProperty("password");
  });

  test("✅ member can also fetch group messages", async () => {
    const member = await makeUser("GMsg Member");
    await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(admin._id))
      .send({ userId: member._id });

    const res = await request(app)
      .get(`/api/group/${group._id}/messages`)
      .set("Cookie", authCookie(member._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("❌ non-member cannot fetch group messages", async () => {
    const stranger = await makeUser("GMsg Stranger");
    const res = await request(app)
      .get(`/api/group/${group._id}/messages`)
      .set("Cookie", authCookie(stranger._id));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not a member/i);
  });

  test("❌ returns 404 for non-existent group", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/group/${fakeId}/messages`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(404);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).get(`/api/group/${group._id}/messages`);
    expect(res.status).toBe(401);
  });
});
