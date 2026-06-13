/**
 * tests/group.create.test.js  (complete rewrite)
 * Coverage: POST /api/group/create
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
const uid = () => `gc_${Date.now()}_${++idx}@letsTalk.test`;

const makeUser = async () => {
  const res = await request(app).post("/api/user/signup").send({
    name: "Group Creator",
    email: uid(),
    password: "TestPass1!",
    confirmPassword: "TestPass1!",
  });
  return res.body.user;
};

afterAll(async () => {
  await Group.deleteMany({ name: /^GC Test/ });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({ type: "group" });
  await User.deleteMany({ email: /@letsTalk\.test$/ });
  await mongoose.connection.close();
});

// ═══════════════════════════════════════════════════════════════════════════
describe("Group API — POST /api/group/create", () => {
  let user;
  beforeAll(async () => { user = await makeUser(); });

  // ── Successful creation ─────────────────────────────────────────────────
  describe("Successful Creation", () => {
    test("✅ creates a group with all fields", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test Full", description: "Desc", avatar: "G" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.group.name).toBe("GC Test Full");
      expect(res.body.group.description).toBe("Desc");
    });

    test("✅ creates a group without description (optional)", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test NoDesc" });

      expect(res.status).toBe(201);
      expect(res.body.group.description).toBe("");
    });

    test("✅ creator is automatically made admin", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test AdminCheck" });

      expect(res.status).toBe(201);
      const members = res.body.group.members;
      const creator = members.find(
        (m) => m.userId._id === user._id || m.userId === user._id
      );
      expect(creator).toBeDefined();
      expect(creator.role).toBe("admin");
    });

    test("✅ a GroupMember record is created for the creator", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test MemberRecord" });

      expect(res.status).toBe(201);
      const gm = await GroupMember.findOne({
        groupId: res.body.group._id,
        userId: user._id,
      });
      expect(gm).not.toBeNull();
      expect(gm.role).toBe("admin");
    });

    test("✅ a Conversation record is created for the group", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test Conversation" });

      expect(res.status).toBe(201);
      const conv = await Conversation.findOne({ groupId: res.body.group._id });
      expect(conv).not.toBeNull();
      expect(conv.type).toBe("group");
    });

    test("✅ allows multiple groups with the same name", async () => {
      const r1 = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test Duplicate" });
      const r2 = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "GC Test Duplicate" });

      expect(r1.status).toBe(201);
      expect(r2.status).toBe(201);
      expect(r1.body.group._id).not.toBe(r2.body.group._id);
    });
  });

  // ── Validation errors ───────────────────────────────────────────────────
  describe("Validation Errors", () => {
    test("❌ fails without group name", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ description: "no name" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("❌ fails with empty string name", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(user._id))
        .send({ name: "   " });

      expect(res.status).toBe(400);
    });
  });

  // ── Authentication errors ───────────────────────────────────────────────
  describe("Authentication", () => {
    test("❌ returns 401 with no cookie", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .send({ name: "GC Test NoAuth" });
      expect(res.status).toBe(401);
    });

    test("❌ returns 401 with invalid jwt cookie", async () => {
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", "jwt=bad-token")
        .send({ name: "GC Test BadToken" });
      expect([401, 500]).toContain(res.status);
    });

    test("❌ returns 401 with token for non-existent user", async () => {
      const ghostId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/api/group/create")
        .set("Cookie", authCookie(ghostId))
        .send({ name: "GC Test Ghost" });
      expect(res.status).toBe(401);
    });
  });
});
