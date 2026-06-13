/**
 * tests/group.members.test.js  (complete rewrite)
 * Coverage:
 *   POST   /api/group/:groupId/add-member
 *   DELETE /api/group/:groupId/remove-member/:userId
 *   GET    /api/group/:groupId/members
 *   PUT    /api/group/:groupId/member/:userId/role
 *   POST   /api/group/:groupId/leave
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
const uid = () => `gm_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async (name = "Member User") => {
  const res = await request(app).post("/api/user/signup").send({
    name,
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

const createGroup = async (userId, name = "GM Test Group") =>
  (
    await request(app)
      .post("/api/group/create")
      .set("Cookie", authCookie(userId))
      .send({ name })
  ).body.group;

const addMember = (groupId, adminId, memberId) =>
  request(app)
    .post(`/api/group/${groupId}/add-member`)
    .set("Cookie", authCookie(adminId))
    .send({ userId: memberId });

afterAll(async () => {
  await Group.deleteMany({ name: /^GM Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — POST /api/group/:groupId/add-member", () => {
  let admin, group;
  beforeEach(async () => {
    admin = await makeUser("Add Admin");
    group = await createGroup(admin._id, "GM Test AddMember");
  });

  test("✅ admin can add a new member", async () => {
    const newMember = await makeUser("New Member");
    const res = await addMember(group._id, admin._id, newMember._id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const ids = res.body.group.members.map((m) =>
      typeof m.userId === "object" ? m.userId._id : m.userId
    );
    expect(ids).toContain(newMember._id);
  });

  test("✅ new member has role='member'", async () => {
    const newMember = await makeUser("Role Check Member");
    const res = await addMember(group._id, admin._id, newMember._id);

    const member = res.body.group.members.find((m) => {
      const id = typeof m.userId === "object" ? m.userId._id : m.userId;
      return id === newMember._id;
    });
    expect(member.role).toBe("member");
  });

  test("❌ cannot add a member who is already in the group", async () => {
    const member = await makeUser("Already Member");
    await addMember(group._id, admin._id, member._id);
    const res = await addMember(group._id, admin._id, member._id);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already a member/i);
  });

  test("❌ non-admin member cannot add others", async () => {
    const member = await makeUser("Regular Mem");
    const outsider = await makeUser("Outsider");
    await addMember(group._id, admin._id, member._id);

    const res = await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(member._id))
      .send({ userId: outsider._id });

    expect(res.status).toBe(403);
  });

  test("❌ fails without userId in body", async () => {
    const res = await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .set("Cookie", authCookie(admin._id))
      .send({});

    expect(res.status).toBe(400);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const nm = await makeUser("Unauth Target");
    const res = await request(app)
      .post(`/api/group/${group._id}/add-member`)
      .send({ userId: nm._id });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — GET /api/group/:groupId/members", () => {
  let admin, member, group;
  beforeAll(async () => {
    admin = await makeUser("Get Members Admin");
    member = await makeUser("Get Members Member");
    group = await createGroup(admin._id, "GM Test GetMembers");
    await addMember(group._id, admin._id, member._id);
  });

  test("✅ returns all members for a member", async () => {
    const res = await request(app)
      .get(`/api/group/${group._id}/members`)
      .set("Cookie", authCookie(member._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.members)).toBe(true);
    expect(res.body.members.length).toBeGreaterThanOrEqual(2);
  });

  test("✅ members are populated with name and email", async () => {
    const res = await request(app)
      .get(`/api/group/${group._id}/members`)
      .set("Cookie", authCookie(admin._id));

    res.body.members.forEach((m) => {
      expect(m.userId).toHaveProperty("name");
      expect(m.userId).toHaveProperty("email");
      expect(m.userId).not.toHaveProperty("password");
    });
  });

  test("❌ non-member gets 403", async () => {
    const stranger = await makeUser("Stranger for Members");
    const res = await request(app)
      .get(`/api/group/${group._id}/members`)
      .set("Cookie", authCookie(stranger._id));
    expect(res.status).toBe(403);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).get(`/api/group/${group._id}/members`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — DELETE /api/group/:groupId/remove-member/:userId", () => {
  let admin, memberToRemove, group;

  beforeEach(async () => {
    admin = await makeUser("Remove Admin");
    memberToRemove = await makeUser("To Remove");
    group = await createGroup(admin._id, "GM Test RemoveMember");
    await addMember(group._id, admin._id, memberToRemove._id);
  });

  test("✅ admin can remove a member", async () => {
    const res = await request(app)
      .delete(`/api/group/${group._id}/remove-member/${memberToRemove._id}`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const ids = res.body.group.members.map((m) =>
      typeof m.userId === "object" ? m.userId._id : m.userId
    );
    expect(ids).not.toContain(memberToRemove._id);
  });

  test("❌ admin cannot remove themselves via this endpoint", async () => {
    const res = await request(app)
      .delete(`/api/group/${group._id}/remove-member/${admin._id}`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/leave group/i);
  });

  test("❌ regular member cannot remove others", async () => {
    const other = await makeUser("Other Member");
    await addMember(group._id, admin._id, other._id);

    const res = await request(app)
      .delete(`/api/group/${group._id}/remove-member/${memberToRemove._id}`)
      .set("Cookie", authCookie(other._id));

    expect(res.status).toBe(403);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).delete(
      `/api/group/${group._id}/remove-member/${memberToRemove._id}`
    );
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — PUT /api/group/:groupId/member/:userId/role", () => {
  let admin, member, group;

  beforeEach(async () => {
    admin = await makeUser("Role Admin");
    member = await makeUser("Role Member");
    group = await createGroup(admin._id, "GM Test ChangeRole");
    await addMember(group._id, admin._id, member._id);
  });

  test("✅ admin can promote a member to admin", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "admin" });

    expect(res.status).toBe(200);
    const updated = res.body.group.members.find((m) => {
      const id = typeof m.userId === "object" ? m.userId._id : m.userId;
      return id === member._id;
    });
    expect(updated.role).toBe("admin");
  });

  test("✅ admin can demote an admin to member", async () => {
    // Promote first
    await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "admin" });

    // Demote
    const res = await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "member" });

    expect(res.status).toBe(200);
    const updated = res.body.group.members.find((m) => {
      const id = typeof m.userId === "object" ? m.userId._id : m.userId;
      return id === member._id;
    });
    expect(updated.role).toBe("member");
  });

  test("❌ non-admin cannot change roles", async () => {
    const other = await makeUser("Non Admin");
    await addMember(group._id, admin._id, other._id);

    const res = await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(other._id))
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });

  test("❌ invalid role value is rejected", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "superuser" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid role/i);
  });

  test("❌ returns 404 if member not in group", async () => {
    const ghost = await makeUser("Ghost Member");
    const res = await request(app)
      .put(`/api/group/${group._id}/member/${ghost._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "admin" });

    expect(res.status).toBe(404);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .send({ role: "admin" });
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — POST /api/group/:groupId/leave", () => {
  let admin, member, group;

  beforeEach(async () => {
    admin = await makeUser("Leave Admin");
    member = await makeUser("Leaving Member");
    group = await createGroup(admin._id, "GM Test LeaveGroup");
    await addMember(group._id, admin._id, member._id);
  });

  test("✅ a member can leave a group", async () => {
    const res = await request(app)
      .post(`/api/group/${group._id}/leave`)
      .set("Cookie", authCookie(member._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/left/i);
  });

  test("✅ member no longer appears in the group after leaving", async () => {
    await request(app)
      .post(`/api/group/${group._id}/leave`)
      .set("Cookie", authCookie(member._id));

    const res = await request(app)
      .get(`/api/group/${group._id}/members`)
      .set("Cookie", authCookie(admin._id));

    const ids = res.body.members.map((m) =>
      typeof m.userId === "object" ? m.userId._id : m.userId
    );
    expect(ids).not.toContain(member._id);
  });

  test("❌ sole admin cannot leave (no other admin)", async () => {
    const res = await request(app)
      .post(`/api/group/${group._id}/leave`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/only admin/i);
  });

  test("✅ admin can leave if another admin exists", async () => {
    // Promote member to admin first
    await request(app)
      .put(`/api/group/${group._id}/member/${member._id}/role`)
      .set("Cookie", authCookie(admin._id))
      .send({ role: "admin" });

    const res = await request(app)
      .post(`/api/group/${group._id}/leave`)
      .set("Cookie", authCookie(admin._id));

    expect(res.status).toBe(200);
  });

  test("❌ cannot leave a group you are not in", async () => {
    const outsider = await makeUser("Outsider Leave");
    const res = await request(app)
      .post(`/api/group/${group._id}/leave`)
      .set("Cookie", authCookie(outsider._id));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not a member/i);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).post(`/api/group/${group._id}/leave`);
    expect(res.status).toBe(401);
  });
});
