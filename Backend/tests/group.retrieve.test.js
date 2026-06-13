/**
 * tests/group.retrieve.test.js  (complete rewrite)
 * Coverage:
 *   GET /api/group/all
 *   GET /api/group/:groupId
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
const uid = () => `gr_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async (name = "Retrieve User") => {
  const res = await request(app).post("/api/user/signup").send({
    name,
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

const createGroup = async (userId, name = "GR Test Group") =>
  (
    await request(app)
      .post("/api/group/create")
      .set("Cookie", authCookie(userId))
      .send({ name })
  ).body.group;

afterAll(async () => {
  await Group.deleteMany({ name: /^GR Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — GET /api/group/all", () => {
  let user;
  beforeAll(async () => { user = await makeUser("All Groups User"); });

  test("✅ returns empty array when user has no groups", async () => {
    const freshUser = await makeUser("Fresh User");
    const res = await request(app)
      .get("/api/group/all")
      .set("Cookie", authCookie(freshUser._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.groups)).toBe(true);
  });

  test("✅ returns groups the user belongs to", async () => {
    await createGroup(user._id, "GR Test MyGroup");

    const res = await request(app)
      .get("/api/group/all")
      .set("Cookie", authCookie(user._id));

    expect(res.status).toBe(200);
    expect(res.body.groups.length).toBeGreaterThanOrEqual(1);
    const names = res.body.groups.map((g) => g.name);
    expect(names).toContain("GR Test MyGroup");
  });

  test("✅ does not return groups the user is NOT in", async () => {
    const other = await makeUser("Other Creator");
    await createGroup(other._id, "GR Test OtherGroup");

    const freshUser = await makeUser("Non Member");
    const res = await request(app)
      .get("/api/group/all")
      .set("Cookie", authCookie(freshUser._id));

    expect(res.status).toBe(200);
    const names = res.body.groups.map((g) => g.name);
    expect(names).not.toContain("GR Test OtherGroup");
  });

  test("✅ does not return inactive groups", async () => {
    // Create and then delete a group
    const g = await createGroup(user._id, "GR Test ToDelete");
    await request(app)
      .delete(`/api/group/${g._id}`)
      .set("Cookie", authCookie(user._id));

    const res = await request(app)
      .get("/api/group/all")
      .set("Cookie", authCookie(user._id));

    const ids = res.body.groups.map((grp) => grp._id);
    expect(ids).not.toContain(g._id);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).get("/api/group/all");
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — GET /api/group/:groupId", () => {
  let user, group;

  beforeAll(async () => {
    user = await makeUser("Details User");
    group = await createGroup(user._id, "GR Test Details");
  });

  test("✅ returns group details for a member", async () => {
    const res = await request(app)
      .get(`/api/group/${group._id}`)
      .set("Cookie", authCookie(user._id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.group._id).toBe(group._id);
    expect(res.body.group.name).toBe("GR Test Details");
    expect(res.body.group).toHaveProperty("members");
    expect(res.body.group).toHaveProperty("createdBy");
  });

  test("✅ members array is populated with user name and email", async () => {
    const res = await request(app)
      .get(`/api/group/${group._id}`)
      .set("Cookie", authCookie(user._id));

    const members = res.body.group.members;
    expect(members.length).toBeGreaterThan(0);
    expect(members[0].userId).toHaveProperty("name");
    expect(members[0].userId).toHaveProperty("email");
    expect(members[0].userId).not.toHaveProperty("password");
  });

  test("❌ returns 403 when a non-member requests group details", async () => {
    const stranger = await makeUser("Stranger");
    const res = await request(app)
      .get(`/api/group/${group._id}`)
      .set("Cookie", authCookie(stranger._id));

    expect(res.status).toBe(403);
  });

  test("❌ returns 404 for a non-existent group id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/group/${fakeId}`)
      .set("Cookie", authCookie(user._id));

    expect(res.status).toBe(404);
  });

  test("❌ returns 401 without auth cookie", async () => {
    const res = await request(app).get(`/api/group/${group._id}`);
    expect(res.status).toBe(401);
  });
});
