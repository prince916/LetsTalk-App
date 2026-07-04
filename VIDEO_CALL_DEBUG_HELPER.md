# Video Call Debug Helper

## Quick Testing Commands

You can paste these commands into the browser console while testing video calls to get debugging information:

### 1. Check Call Context State
```javascript
// Check current call state
const callContext = window.__callContextDebug;
console.log("Active Call:", callContext?.activeCall);
console.log("Local Stream:", callContext?.localStream?.getTracks());
console.log("Remote Stream:", callContext?.remoteStream?.getTracks());
console.log("Is Muted:", callContext?.isMuted);
console.log("Is Camera Off:", callContext?.isCameraOff);
```

### 2. Check WebRTC Peer Connection State
```javascript
// Check peer connection status
const pc = window.__peerConnectionDebug;
if (pc) {
  console.log("Signaling State:", pc.signalingState);
  console.log("Connection State:", pc.connectionState);
  console.log("ICE Connection State:", pc.iceConnectionState);
  console.log("ICE Gathering State:", pc.iceGatheringState);
} else {
  console.log("No peer connection found");
}
```

### 3. Get Peer Connection Stats
```javascript
// Get detailed connection statistics
async function getPeerStats() {
  const pc = window.__peerConnectionDebug;
  if (!pc) return console.log("No peer connection");
  
  const stats = await pc.getStats();
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      console.log('Video Inbound:', {
        bytesReceived: report.bytesReceived,
        packetsReceived: report.packetsReceived,
        packetsLost: report.packetsLost,
        jitter: report.jitter,
        framesDecoded: report.framesDecoded
      });
    }
    if (report.type === 'outbound-rtp' && report.kind === 'video') {
      console.log('Video Outbound:', {
        bytesSent: report.bytesSent,
        packetsSent: report.packetsSent,
        framesEncoded: report.framesEncoded,
        frameRate: report.framesPerSecond
      });
    }
  });
}
getPeerStats();
```

### 4. Check Video Element Status
```javascript
// Check if video elements are properly set up
console.log("Local Video Ref srcObject:", 
  document.querySelector('video[style*="width"]')?.srcObject);
console.log("Remote Video Ref srcObject:", 
  document.querySelector('video[style*="object-contain"]')?.srcObject);
```

### 5. Check Socket Connection
```javascript
// Check socket.io connection status
const socket = window.__socketDebug;
if (socket) {
  console.log("Socket Connected:", socket.connected);
  console.log("Socket ID:", socket.id);
  console.log("Socket URL:", socket.io.uri);
} else {
  console.log("No socket found");
}
```

### 6. Simulate Media Stream
```javascript
// Test getting media stream
async function testMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true }
    });
    console.log("Media stream obtained:", stream.getTracks().length, "tracks");
    stream.getTracks().forEach(track => {
      console.log(`- ${track.kind}: ${track.label}`);
    });
    // Stop tracks after test
    stream.getTracks().forEach(t => t.stop());
  } catch (error) {
    console.error("Media stream error:", error);
  }
}
testMediaStream();
```

### 7. List Available Media Devices
```javascript
// List all available cameras and microphones
async function listDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    const mics = devices.filter(d => d.kind === 'audioinput');
    
    console.log("Available Cameras:", cameras.length);
    cameras.forEach(c => console.log(`  - ${c.label} (${c.deviceId})`));
    
    console.log("Available Microphones:", mics.length);
    mics.forEach(m => console.log(`  - ${m.label} (${m.deviceId})`));
  } catch (error) {
    console.error("Error listing devices:", error);
  }
}
listDevices();
```

## Expected Console Output During Call

### Caller Starting Call
```
Starting video call to: Alice
Requesting media stream...
Media stream obtained successfully: 2 tracks
Got local stream with 2 tracks
Created peer connection
Attaching local tracks to peer connection
Created and set local description
```

### Receiver Answering Call  
```
Incoming call from: Bob
Answering call from: Bob
Requesting media stream...
Media stream obtained successfully: 2 tracks
Got local stream with 2 tracks
Created peer connection
Attaching local tracks to peer connection
Setting remote description from offer
Flushing pending ICE candidates
ICE candidate: (multiple times)
Creating answer
Local description set
Sending answer
Setting remote stream 2 tracks
Received remote track: video
Received remote track: audio
```

## Troubleshooting Matrix

| Symptom | First Check | Second Check | Third Check |
|---------|------------|--------------|------------|
| Local video black | Permissions | Camera device | Camera toggle |
| Remote video black | Remote side camera | Network connection | Browser dev tools |
| No audio | Mic muted in app | Mic muted in OS | Browser permissions |
| Call won't connect | Check console errors | Check socket connected | Check network |
| Audio/Video lag | Check bitrate stats | Check network ping | Close other apps |

## Performance Benchmarks

### Expected Values (Good Connection)

| Metric | Expected | Warning | Critical |
|--------|----------|---------|----------|
| Frames/sec (video) | 24-30 | <20 | <10 |
| Jitter (audio) | <50ms | 50-100ms | >100ms |
| Packet Loss | <0.1% | 0.1-1% | >1% |
| Round Trip Latency | <50ms | 50-100ms | >100ms |
| Video Bitrate | 1-3 Mbps | 0.5-1 Mbps | <0.5 Mbps |

## Common Patterns to Look For

### Good Call Flow
```
1. "Starting video call to: Alice"
2. "Media stream obtained successfully: 2 tracks"
3. "Created and set local description"
4. [Wait for remote response]
5. "Setting remote stream 2 tracks"
6. "Received remote track: video"
7. "Received remote track: audio"
```

### Connection Problem
```
- Missing "Received remote track" messages
- "No peer connection yet" appears late in call
- Multiple "Adding ICE candidate" followed by "Error adding ICE candidate"
```

### Permission Problem
```
- "Media stream obtained successfully: 0 tracks"
- "Camera/microphone permission denied"
- "No camera or microphone found"
```

## Browser-Specific Tips

### Chrome/Chromium
- Check: chrome://webrtc-internals/ for detailed connection stats
- May require HTTPS in production (not needed for localhost)

### Firefox
- Check: about:networking#webrtc for connection details
- May have different codec support

### Safari
- Requires specific autoPlay configuration
- May not support all WebRTC features

### Edge
- Generally same as Chrome (Chromium-based)
- Check Settings → Privacy and security → Camera/Microphone

## Network Diagnostics

```javascript
// Check your network speed and latency
async function checkNetwork() {
  // This is a simple ping test
  const start = performance.now();
  const response = await fetch('/api/user/check', { method: 'GET' });
  const end = performance.now();
  console.log("Network latency (ping):", Math.round(end - start), "ms");
  console.log("Response status:", response.status);
}
checkNetwork();
```

## File Reference

- Main Context: `Backend/Frontend/src/context/CallContext.jsx`
- UI Component: `Backend/Frontend/src/components/VideoCallModal.jsx`
- Call Button: `Backend/Frontend/src/home/right/Chatuser.jsx`
- Socket Server: `Backend/SocketIO/server.js`

## Logs to Save for Support

When reporting an issue, save these logs:
1. Console output from browser DevTools
2. Browser name and version (Help → About)
3. Screenshot of video call window
4. Network tab exports from DevTools
