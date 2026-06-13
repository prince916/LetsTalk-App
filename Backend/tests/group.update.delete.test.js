/**
 * tests/group.update.delete.test.js  (complete rewrite)
 * Coverage:
 *   PUT    /api/group/:groupId/update
 *   DELETE /api/group/:groupId
 */
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").default;
const User = require("../models/user.model").default;
const Group = require("../models/group.model").default;
const GroupMember = require("../models/groupMember.model").default;
const Conversation = require("../models/conversation.model").default;
const { authCookie } = require("./setup");

let idx = 0;
const uid = () => `gud_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async (name = "UD User") => {
  const res = await request(app).post("/api/user/signup").send({
    name,
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

const createGroup = async (userId, name = "GUD Test Group") =>
  (
    await request(app)
      .post("/api/group/create")
      .set("Cookie", authCookie(userId))
      .send({ name })
  ).body.group;

afterAll(async () => {
  await Group.deleteMany({ name: /^GUD Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — PUT /api/group/:groupId/update", () => {
  let admin, group;

  beforeEach(async () => {
    admin = await makeUser("Admin Update");
    group = await createGroup(admin._id, "GUD Test UpdateBase");
  });

  test("✅ admin can update group name", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(admin._id))
      .send({ name: "GUD Test Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group.name).toBe("GUD Test Updated Name");
  });

  test("✅ admin can update description", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(admin._id))
      .send({ description: "New Description" });

    expect(res.status).toBe(200);
    expect(res.body.group.description).toBe("New Description");
  });

  test("✅ admin can update avatar", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(admin._id))
      .send({ avatar: "🔥" });

    expect(res.status).toBe(200);
    expect(res.body.group.avatar).toBe("🔥");
  });

  test("✅ empty name field is ignored (name unchanged)", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(admin._id))
      .send({ name: "", description: "Only desc changed" });

    expect(res.status).toBe(200);
    // Name should remain the same; description updated
    expect(res.body.group.description).toBe("Only desc changed");
  });

  test("❌ non-admin member cannot update group", async () => {
    // Add a regular member
    const member = await makeUser("Regular Member");
    await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(admin._id))
      .send({ userId: member._id });

    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(member._id))
      .send({ name: "GUD Test Hijacked" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/admin/i);
  });

  test("❌ non-member cannot update group", async () => {
    const stranger = await makeUser("Stranger");
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .set("Cookie", authCookie(stranger._id))
      .send({ name: "GUD Test Hijacked" });

    expect(res.status).toBe(403);
  });

  test("❌ returns 404 for non-existent group", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/group/${fakeId}/update`)
      .set("Cookie", authCookie(admin._id))
      .send({ name: "GUD Test Ghost" });

    expect(res.status).toBe(404);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/update`)
      .send({ name: "GUD Test NoAuth" });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — DELETE /api/group/:groupId", () => {
  let admin, group;

  beforeEach(async () => {
    admin = await makeUser("Admin Delete");
    group = await createGroup(admin._id, "GUD Test DeleteBase");
  });

  test("✅ creator (admin) can delete their group", async () => {
    const res = await request(app)
      .delete(`/api/group/${group._id}`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test("✅ deleted group is marked isActive=false (soft delete)", async () => {
    await request(app)
      .delete(`/api/group/${group._id}`)
      .set("Cookie", authCookie(admin._id));

    const dbGroup = await Group.findById(group._id);
    expect(dbGroup.isActive).toBe(false);
  });

  test("✅ deleted group no longer appears in getAllGroups", async () => {
    await request(app)
      .delete(`/api/group/${group._id}`)
      .set("Cookie", authCookie(admin._id));

    const res = await request(app)
      .get("/api/group/all")
      .set("Cookie", authCookie(admin._id));

    const ids = res.body.groups.map((g) => g._id);
    expect(ids).not.toContain(group._id);
  });

  test("❌ non-creator cannot delete the group", async () => {
    const member = await makeUser("Non Creator");
    await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(admin._id))
      .send({ userId: member._id });

    const res = await request(app)
      .delete(`/api/group/${group._id}`)
      .set("Cookie", authCookie(member._id));

    expect(res.status).toBe(403);
  });

  test("❌ returns 404 for non-existent group", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/group/${fakeId}`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(404);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).delete(`/api/group/${group._id}`);
    expect(res.status).toBe(401);
  });
});
