/**
 * src/__tests__/VideoCallModal.test.jsx
 *
 * Tests that BOTH sides of a video call can see each other.
 * No real camera/WebRTC hardware is involved — we supply mock MediaStream
 * objects and verify that the video elements receive the correct srcObject
 * (which is what makes the video visible in the browser).
 *
 * Layout of VideoCallModal:
 *   videos[0] = remote video  (full-screen, shows the OTHER person)
 *   videos[1] = local video   (small PIP, shows YOUR OWN camera)
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import VideoCallModal from "../components/VideoCallModal.jsx";
import { CallContext } from "../context/CallStateContext.jsx";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Minimal MediaStream stub — just enough for srcObject assignment checks */
const createMockStream = () => ({
  getTracks: () => [],
  getVideoTracks: () => [],
  getAudioTracks: () => [],
});

const activeCallBase = {
  userId: "user-bob",
  name: "Bob",
  status: "connected",
  isIncoming: false,
};

/** Wrap VideoCallModal with a fully-controlled mock context */
const renderModal = (overrides = {}) => {
  const contextValue = {
    activeCall: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isCameraOff: false,
    endCall: vi.fn(),
    toggleMute: vi.fn(),
    toggleCamera: vi.fn(),
    ...overrides,
  };
  return render(
    <CallContext.Provider value={contextValue}>
      <VideoCallModal />
    </CallContext.Provider>
  );
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe("VideoCallModal — video visibility", () => {
  // ── Baseline ─────────────────────────────────────────────────────────────

  test("renders nothing when there is no active call", () => {
    const { container } = renderModal();
    expect(container.firstChild).toBeNull();
  });

  // ── Local video (your own camera) ─────────────────────────────────────────

  test("caller sees their own camera — local video has srcObject", () => {
    const localStream = createMockStream();
    const { container } = renderModal({
      activeCall: { ...activeCallBase, isIncoming: false },
      localStream,
    });

    const localVideo = container.querySelectorAll("video")[1];
    expect(localVideo.srcObject).toBe(localStream);
    expect(localVideo).not.toHaveClass("hidden");
  });

  test("callee sees their own camera — local video has srcObject", () => {
    const localStream = createMockStream();
    const { container } = renderModal({
      activeCall: { ...activeCallBase, isIncoming: true },
      localStream,
    });

    const localVideo = container.querySelectorAll("video")[1];
    expect(localVideo.srcObject).toBe(localStream);
    expect(localVideo).not.toHaveClass("hidden");
  });

  test("local video is hidden and shows placeholder when stream is not ready", () => {
    const { container, getByText } = renderModal({
      activeCall: activeCallBase,
      localStream: null,
    });

    const localVideo = container.querySelectorAll("video")[1];
    expect(localVideo).toHaveClass("hidden");
    expect(getByText("Starting camera...")).toBeInTheDocument();
  });

  // ── Remote video (the other person's camera) ──────────────────────────────

  test("caller sees the callee — remote video has srcObject", () => {
    const remoteStream = createMockStream();
    const { container } = renderModal({
      activeCall: { ...activeCallBase, isIncoming: false },
      remoteStream,
    });

    const remoteVideo = container.querySelectorAll("video")[0];
    expect(remoteVideo.srcObject).toBe(remoteStream);
    expect(remoteVideo).not.toHaveClass("hidden");
  });

  test("callee sees the caller — remote video has srcObject", () => {
    const remoteStream = createMockStream();
    const { container } = renderModal({
      activeCall: { ...activeCallBase, isIncoming: true },
      remoteStream,
    });

    const remoteVideo = container.querySelectorAll("video")[0];
    expect(remoteVideo.srcObject).toBe(remoteStream);
    expect(remoteVideo).not.toHaveClass("hidden");
  });

  test("waiting placeholder shown when remote stream has not arrived yet", () => {
    const { getByText } = renderModal({
      activeCall: activeCallBase,
      remoteStream: null,
    });

    expect(getByText("Waiting for video...")).toBeInTheDocument();
  });

  // ── Both sides see each other ─────────────────────────────────────────────

  test("✅ BOTH SIDES CAN SEE EACH OTHER — both video elements have srcObject", () => {
    const localStream = createMockStream();
    const remoteStream = createMockStream();

    const { container } = renderModal({
      activeCall: { ...activeCallBase, status: "connected" },
      localStream,
      remoteStream,
    });

    const [remoteVideo, localVideo] = container.querySelectorAll("video");

    // Your own camera
    expect(localVideo.srcObject).toBe(localStream);
    expect(localVideo).not.toHaveClass("hidden");

    // The other person's camera
    expect(remoteVideo.srcObject).toBe(remoteStream);
    expect(remoteVideo).not.toHaveClass("hidden");
  });

  // ── Stream updates during the call ────────────────────────────────────────

  test("remote video srcObject updates when stream is replaced mid-call", async () => {
    const streamV1 = createMockStream();
    const contextValue = (stream) => ({
      activeCall: activeCallBase,
      localStream: null,
      remoteStream: stream,
      isMuted: false,
      isCameraOff: false,
      endCall: vi.fn(),
      toggleMute: vi.fn(),
      toggleCamera: vi.fn(),
    });

    const { container, rerender } = render(
      <CallContext.Provider value={contextValue(streamV1)}>
        <VideoCallModal />
      </CallContext.Provider>
    );

    const remoteVideo = container.querySelectorAll("video")[0];
    expect(remoteVideo.srcObject).toBe(streamV1);

    const streamV2 = createMockStream();
    await act(async () => {
      rerender(
        <CallContext.Provider value={contextValue(streamV2)}>
          <VideoCallModal />
        </CallContext.Provider>
      );
    });

    expect(remoteVideo.srcObject).toBe(streamV2);
  });

  test("local video srcObject updates when stream is replaced (e.g. camera re-granted)", async () => {
    const stream1 = createMockStream();
    const contextValue = (stream) => ({
      activeCall: activeCallBase,
      localStream: stream,
      remoteStream: null,
      isMuted: false,
      isCameraOff: false,
      endCall: vi.fn(),
      toggleMute: vi.fn(),
      toggleCamera: vi.fn(),
    });

    const { container, rerender } = render(
      <CallContext.Provider value={contextValue(stream1)}>
        <VideoCallModal />
      </CallContext.Provider>
    );

    const localVideo = container.querySelectorAll("video")[1];
    expect(localVideo.srcObject).toBe(stream1);

    const stream2 = createMockStream();
    await act(async () => {
      rerender(
        <CallContext.Provider value={contextValue(stream2)}>
          <VideoCallModal />
        </CallContext.Provider>
      );
    });

    expect(localVideo.srcObject).toBe(stream2);
  });

  // ── Controls visibility ───────────────────────────────────────────────────

  test("mute / camera buttons are rendered during an active call", () => {
    const { getByLabelText } = renderModal({
      activeCall: activeCallBase,
    });

    expect(getByLabelText("Mute microphone")).toBeInTheDocument();
    expect(getByLabelText("End call")).toBeInTheDocument();
    expect(getByLabelText("Turn camera off")).toBeInTheDocument();
  });

  test("mute icon reflects isMuted state", () => {
    const { getByLabelText } = renderModal({
      activeCall: activeCallBase,
      isMuted: true,
    });

    expect(getByLabelText("Unmute microphone")).toBeInTheDocument();
  });

  test("camera icon reflects isCameraOff state", () => {
    const { getByLabelText } = renderModal({
      activeCall: activeCallBase,
      isCameraOff: true,
    });

    expect(getByLabelText("Turn camera on")).toBeInTheDocument();
  });
});
