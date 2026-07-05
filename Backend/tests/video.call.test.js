/**
 * tests/video.call.test.js
 *
 * Integration tests for the Socket.IO video-call signaling layer.
 *
 * What is tested (server-side handlers only — no WebRTC / browser APIs):
 *   callUser      → incomingCall to online receiver
 *   callUser      → callUnavailable when receiver is offline
 *   answerCall    → callAnswered routed back to caller
 *   iceCandidate  → iceCandidate routed to target
 *   rejectCall    → callRejected + activeCalls cleared
 *   endCall       → callEnded   + activeCalls cleared
 *   disconnect    → callEnded to partner (activeCalls crash-safety fix)
 */

const { io: ClientIO } = require("socket.io-client");
const mongoose = require("mongoose");

// babel-jest transpiles ESM → CJS so we can require the server
const { server } = require("../SocketIO/server");

// ── Helpers ────────────────────────────────────────────────────────────────

/** Open a socket.io connection as a specific userId */
const connectSocket = (port, userId) =>
  new Promise((resolve, reject) => {
    const sock = ClientIO(`http://localhost:${port}`, {
      query: { userId },
      transports: ["websocket"],
      forceNew: true,
      timeout: 5000,
    });
    sock.on("connect", () => resolve(sock));
    sock.on("connect_error", (err) => reject(err));
  });

/** Wait for a single named event, reject after `ms` ms */
const waitFor = (socket, event, ms = 3000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout waiting for "${event}"`)),
      ms
    );
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

// ── Server lifecycle ────────────────────────────────────────────────────────

let port;

beforeAll((done) => {
  if (server.listening) {
    port = server.address().port;
    done();
  } else {
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  }
});

afterAll((done) => {
  server.close(done);
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Video Call Signaling", () => {
  // ── callUser ──────────────────────────────────────────────────────────────
  describe("callUser", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    const userOffline = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ routes incomingCall to the online receiver", async () => {
      const offer = { type: "offer", sdp: "v=0\r\n" };
      const incomingPromise = waitFor(sockB, "incomingCall");

      sockA.emit("callUser", { to: userB, from: userA, fromName: "Alice", offer });

      const incoming = await incomingPromise;
      expect(incoming.from).toBe(userA);
      expect(incoming.fromName).toBe("Alice");
      expect(incoming.offer).toEqual(offer);

      // Clean up the call that was just established so activeCalls stays tidy
      sockA.emit("endCall", { to: userB });
      await waitFor(sockB, "callEnded").catch(() => {});
    });

    test("✅ emits callUnavailable when receiver is not connected", async () => {
      const unavailablePromise = waitFor(sockA, "callUnavailable");
      sockA.emit("callUser", {
        to: userOffline,
        from: userA,
        fromName: "Alice",
        offer: { type: "offer", sdp: "" },
      });
      // Server emits "callUnavailable" with no payload — just assert the event fires
      await expect(unavailablePromise).resolves.toBeUndefined();
    });
  });

  // ── answerCall ────────────────────────────────────────────────────────────
  describe("answerCall", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);

      // Initiate the call so activeCalls is populated
      sockA.emit("callUser", {
        to: userB,
        from: userA,
        fromName: "Alice",
        offer: { type: "offer", sdp: "" },
      });
      await waitFor(sockB, "incomingCall");
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ routes callAnswered back to the caller", async () => {
      const answer = { type: "answer", sdp: "v=0\r\n" };
      const answeredPromise = waitFor(sockA, "callAnswered");

      sockB.emit("answerCall", { to: userA, from: userB, answer });

      const result = await answeredPromise;
      expect(result.answer).toEqual(answer);
    });
  });

  // ── iceCandidate ──────────────────────────────────────────────────────────
  describe("iceCandidate", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ routes an ICE candidate to the target user", async () => {
      const candidate = {
        candidate: "candidate:1 1 UDP 2113937151 192.168.1.1 54321 typ host",
        sdpMid: "0",
        sdpMLineIndex: 0,
      };
      const candidatePromise = waitFor(sockB, "iceCandidate");

      sockA.emit("iceCandidate", { to: userB, candidate });

      const received = await candidatePromise;
      expect(received.candidate).toEqual(candidate);
    });
  });

  // ── rejectCall ────────────────────────────────────────────────────────────
  describe("rejectCall", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);

      sockA.emit("callUser", {
        to: userB,
        from: userA,
        fromName: "Alice",
        offer: { type: "offer", sdp: "" },
      });
      await waitFor(sockB, "incomingCall");
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ routes callRejected to the caller with reason", async () => {
      const rejectedPromise = waitFor(sockA, "callRejected");
      sockB.emit("rejectCall", { to: userA, reason: "busy" });

      const result = await rejectedPromise;
      expect(result.reason).toBe("busy");
    });
  });

  // ── endCall ───────────────────────────────────────────────────────────────
  describe("endCall", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);

      // Full call setup
      sockA.emit("callUser", {
        to: userB,
        from: userA,
        fromName: "Alice",
        offer: { type: "offer", sdp: "" },
      });
      await waitFor(sockB, "incomingCall");

      sockB.emit("answerCall", {
        to: userA,
        from: userB,
        answer: { type: "answer", sdp: "" },
      });
      await waitFor(sockA, "callAnswered");
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ routes callEnded to the other party", async () => {
      const endedPromise = waitFor(sockB, "callEnded");
      sockA.emit("endCall", { to: userB });
      await expect(endedPromise).resolves.toBeDefined();
    });
  });

  // ── disconnect mid-call ───────────────────────────────────────────────────
  describe("disconnect mid-call (crash-safety fix)", () => {
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    let sockA, sockB;

    beforeAll(async () => {
      sockA = await connectSocket(port, userA);
      sockB = await connectSocket(port, userB);

      // Initiate call to populate activeCalls
      sockA.emit("callUser", {
        to: userB,
        from: userA,
        fromName: "Alice",
        offer: { type: "offer", sdp: "" },
      });
      await waitFor(sockB, "incomingCall");
    });

    afterAll(() => {
      sockA?.disconnect();
      sockB?.disconnect();
    });

    test("✅ notifies partner with callEnded when a user disconnects mid-call", async () => {
      const endedPromise = waitFor(sockB, "callEnded", 5000);
      sockA.disconnect(); // simulate browser crash / tab close
      await expect(endedPromise).resolves.toBeDefined();
    });
  });
});
