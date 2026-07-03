/**
 * tests/chat.flow.integration.test.js
 *
 * Focused end-to-end backend flow validation for:
 * - signup + login session persistence
 * - direct messaging between two users
 * - group creation, member add, and group messaging
 */
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app").default;
const User = require("../models/user.model").default;
const Group = require("../models/group.model").default;
const GroupMember = require("../models/groupMember.model").default;
const Conversation = require("../models/conversation.model").default;
const Message = require("../models/message.model").default;

let emailIndex = 0;
const uniqueEmail = (prefix) =>
  `${prefix}_${Date.now()}_${++emailIndex}@flow.letstalk.test`;

const createAgentUser = async (agent, name, prefix) => {
  const email = uniqueEmail(prefix);
  const password = "FlowPass123!";

  const signupRes = await agent.post("/api/user/signup").send({
    name,
    email,
    password,
    confirmPassword: password,
  });

  expect(signupRes.status).toBe(201);
  expect(signupRes.body.user.email).toBe(email.toLowerCase());

  const logoutRes = await agent.post("/api/user/logout");
  expect(logoutRes.status).toBe(201);

  const loginRes = await agent.post("/api/user/login").send({
    email,
    password,
  });

  expect(loginRes.status).toBe(201);

  return {
    user: loginRes.body.user,
    email,
    password,
  };
};

afterAll(async () => {
  await Group.deleteMany({ name: /^Flow Integration / });
  await GroupMember.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({
    $or: [
      { message: /^Flow direct / },
      { message: /^Flow group / },
    ],
  });
  await User.deleteMany({ email: /@flow\.letstalk\.test$/ });
  await mongoose.connection.close();
});

describe("Chat flow integration", () => {
  test("signup/login, direct messaging, and group messaging work together", async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);

    const { user: userA } = await createAgentUser(
      agentA,
      "Flow User A",
      "flow_user_a"
    );
    const { user: userB } = await createAgentUser(
      agentB,
      "Flow User B",
      "flow_user_b"
    );

    const directText = `Flow direct ${Date.now()}`;
    const sendDirectRes = await agentA
      .post(`/api/message/send/${userB._id}`)
      .send({ message: directText });

    expect(sendDirectRes.status).toBe(201);
    expect(sendDirectRes.body.message).toBe(directText);
    expect(sendDirectRes.body.senderId).toBe(userA._id);
    expect(sendDirectRes.body.receiverId).toBe(userB._id);

    const getDirectRes = await agentB.get(`/api/message/get/${userA._id}`);

    expect(getDirectRes.status).toBe(201);
    expect(Array.isArray(getDirectRes.body)).toBe(true);
    expect(getDirectRes.body.at(-1).message).toBe(directText);

    const groupName = `Flow Integration ${Date.now()}`;
    const createGroupRes = await agentA.post("/api/group/create").send({
      name: groupName,
      description: "Automated flow validation group",
    });

    expect(createGroupRes.status).toBe(201);
    expect(createGroupRes.body.success).toBe(true);

    const groupId = createGroupRes.body.group._id;

    const addMemberRes = await agentA
      .post(`/api/group/${groupId}/add-member`)
      .send({ userId: userB._id });

    expect(addMemberRes.status).toBe(200);

    const groupText = `Flow group ${Date.now()}`;
    const sendGroupRes = await agentA
      .post(`/api/message/group/send/${groupId}`)
      .send({ message: groupText });

    expect(sendGroupRes.status).toBe(201);
    expect(sendGroupRes.body.success).toBe(true);
    expect(sendGroupRes.body.message.message).toBe(groupText);

    const getGroupRes = await agentB.get(`/api/group/${groupId}/messages`);

    expect(getGroupRes.status).toBe(200);
    expect(getGroupRes.body.success).toBe(true);
    expect(Array.isArray(getGroupRes.body.messages)).toBe(true);
    expect(getGroupRes.body.messages.at(-1).message).toBe(groupText);
  });
});