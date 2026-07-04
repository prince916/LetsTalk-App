# LetsTalk Codebase Context

Generated: 2026-07-04

## 1. Repository Snapshot

- Workspace root: LetsTalk
- Runtime shape: monorepo-style app where backend is primary root and frontend is nested under Backend/Frontend
- Main stacks:
  - Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT cookie auth, Multer uploads, Jest + Supertest
  - Frontend: React + Vite, Tailwind CSS + DaisyUI, Zustand, React Context, Axios, Socket.IO client
- File inventory (excluding node_modules, .git, dist, coverage):
  - Total files: 121
  - .js: 42
  - .jsx: 37
  - .md: 7
  - .json/.cjs and assets/log/env files make up the rest

## 2. High-Level Architecture

### 2.1 Backend core

- Entry server: Backend/index.js
- Test app entry: Backend/app.js (exports app without listen)
- Socket server and shared app instance: Backend/SocketIO/server.js
- API modules:
  - /api/user via routes/user.route.js
  - /api/message via routes/message.route.js
  - /api/group via routes/group.route.js
- Persistence: MongoDB via Mongoose models in Backend/models

### 2.2 Frontend core

- Frontend root: Backend/Frontend
- App bootstrap: src/main.jsx
- Main app shell/routing: src/App.jsx
- State and side effects:
  - Auth: AuthProvider/AuthContext
  - Socket presence: SocketProvider
  - Group state/event fanout: GroupProvider
  - Call/WebRTC state: CallProvider
  - Zustand stores: useConversation, useGroup

### 2.3 Deployment topology

- Backend serves SPA static files only in production:
  - static path = Backend/Frontend/dist
- Vite dev server runs on port 4001 and proxies to backend on 5002 for:
  - /api
  - /uploads
  - /socket.io

## 3. Backend Details

### 3.1 Startup and middleware flow

1. Load env
2. JSON and cookie parser middleware
3. CORS allowlist (localhost variants + production domain)
4. Static uploads exposed at /uploads
5. Connect to MongoDB using MONGODB_URI
6. Mount user/message/group routes
7. In production, serve Frontend/dist + SPA fallback
8. Listen via HTTP server from Socket.IO module

### 3.2 Authentication model

- Auth middleware: secureRoute.js
- Token source used for authorization: req.cookies.jwt
- Token secret env key: JWT_TOKEN
- Cookie behavior in generateToken.js:
  - httpOnly always true
  - secure and sameSite adjusted for localhost vs production host
- Note: frontend sometimes also sends Authorization Bearer header, but secureRoute currently validates cookie only

### 3.3 API Surface

#### User routes

- POST /api/user/signup
- POST /api/user/login
- POST /api/user/logout
- GET /api/user/session
- GET /api/user/allUsers

#### Direct and group message routes

- POST /api/message/send/:id
- GET /api/message/get/:id
- POST /api/message/group/send/:groupId
- POST /api/message/group/send-image/:groupId

#### Group routes

- POST /api/group/create
- GET /api/group/all
- GET /api/group/:groupId
- GET /api/group/:groupId/messages
- PUT /api/group/:groupId/update
- DELETE /api/group/:groupId
- POST /api/group/:groupId/add-member
- DELETE /api/group/:groupId/remove-member/:userId
- GET /api/group/:groupId/members
- PUT /api/group/:groupId/member/:userId/role
- POST /api/group/:groupId/leave

### 3.4 Data model summary

- User
  - name, email (unique/lowercase), password, profilePicture, timestamps
- Message
  - senderId, receiverId (direct), groupId (group), conversationId
  - message body and optional image metadata
  - messageType in [text, image, system]
- Conversation
  - type in [direct, group]
  - members[]
  - optional groupId
  - messages[]
- Group
  - name, description, avatar, createdBy
  - embedded members[] with role admin/member
  - isActive soft-delete flag
- GroupMember
  - separate membership collection for tracking
  - unique compound index (groupId + userId)

### 3.5 Real-time socket design

Socket.IO server tracks:

- users map: userId -> socketId
- groupRooms map: groupId -> set(userId)

Events handled:

- Presence:
  - getOnlineUsers emit on connect/disconnect
- Group room events:
  - joinGroup, leaveGroup
  - groupTyping, groupStoppedTyping
  - getGroupOnlineUsers
  - server emits: groupOnlineUsers, userJoinedGroup, userLeftGroup, groupTypingIndicator, groupStoppedTypingIndicator
- Message push:
  - newMessage for direct chats
  - newGroupMessage for group chats
- Video/WebRTC signaling:
  - callUser, incomingCall, answerCall, callAnswered
  - iceCandidate
  - rejectCall/callRejected
  - endCall/callEnded

## 4. Frontend Details

### 4.1 Routing and app shell

- Public routes:
  - /login
  - /signup
- Protected route:
  - /
- Layout behavior:
  - desktop: left sidebar + right panel
  - mobile: toggles between list and chat via MobileViewContext
- Suspense/lazy loading used for major panels and call modals

### 4.2 Auth/session behavior

- AuthProvider reads localStorage key ChatApp
- If cached user exists, provider validates server session via /api/user/session
- On invalid session, local storage is cleared and user set to null
- Login writes auth payload as { user: ... } to localStorage

### 4.3 API client behavior

- axiosConfig picks base URL dynamically:
  - local browser: empty baseURL to use Vite same-origin proxy
  - production browser: window.location.origin
  - fallback: http://localhost:5002
- withCredentials enabled for cookie-based auth

### 4.4 State management split

- React Context layers:
  - AuthContext: authUser/authReady
  - SocketContext: socket instance + online users
  - GroupContext: selectedGroup, groups, members, online users, typing users
  - CallContext: incoming/active call and media controls
- Zustand stores:
  - useConversation: direct chat selection and messages
  - useGroup: group selection and messages

### 4.5 Message and group flows (client)

- Direct chat:
  - select user -> fetch /api/message/get/:id
  - send -> POST /api/message/send/:id
  - receive realtime via socket newMessage
- Group chat:
  - load groups -> /api/group/all
  - select group -> fetch group messages + join room
  - send -> /api/message/group/send/:groupId
  - receive realtime via socket newGroupMessage
  - typing and online users handled by group socket events

### 4.6 UI composition

- Left area:
  - Search
  - Users list (direct)
  - Groups list + create group modal
- Right area:
  - Direct chat panel (header/messages/input)
  - GroupChatInterface with tabs:
    - Chat
    - Members
    - Info/settings
- Auth pages:
  - custom styled login/signup with toasts and validation

## 5. Testing and Quality Signals

### 5.1 Test framework

- Jest config in Backend/jest.config.cjs
- Node test environment
- Babel transform for .js
- Serial execution (maxWorkers: 1)
- Timeout: 30s

### 5.2 Test helpers

- tests/setup.js provides:
  - test user/group factories
  - JWT generation using JWT_TOKEN
  - authCookie helper compatible with cookie-based secureRoute

### 5.3 Test coverage intent

- Docs report broad group API coverage and a large suite around:
  - group CRUD
  - member management
  - group messaging
  - auth/validation edge cases
- Integration flow test exists:
  - signup/login
  - direct message send/get
  - group create/add member/send/get messages

## 6. Important Implementation Notes and Risks

- Directory naming mismatch from old docs:
  - actual frontend path is Backend/Frontend (not root-level frontend)
- Auth transport mismatch risk:
  - server secureRoute validates cookie jwt
  - many frontend hooks still attach Bearer header token from js-cookie
  - this works only if cookie is present; Bearer token alone is not sufficient in current middleware
- Mixed axios usage:
  - some hooks use apiClient (good for proxy/base URL consistency)
  - some hooks use raw axios directly; behavior depends on browser origin/proxy setup
- Duplicate group fetch trigger:
  - useGetAllGroups is called both by Groups component and by useGroupChat wrapper in places, potentially creating redundant requests
- Conversation model naming:
  - mongoose model name is lowercase "conversation" while others are PascalCase

## 7. Key Environment Inputs

Likely required in Backend/.env:

- PORT (default 5002)
- MONGODB_URI
- JWT_TOKEN
- NODE_ENV
- Optional URL hints used by controllers/cors:
  - CLIENT_URL
  - BACKEND_URL
  - APP_URL

## 8. Practical Run Commands

From Backend:

- npm run dev
- npm start
- npm run build (installs frontend and builds nested Frontend)
- npm test
- npm run test:flow
- npm run test:coverage

From Backend/Frontend:

- npm run dev
- npm run build
- npm run lint
- npm run preview

## 9. Suggested Next Cleanup Targets (Optional)

1. Standardize frontend API calls to use apiClient everywhere.
2. Decide on one auth transport strategy (cookie-only, bearer-only, or dual support in middleware).
3. Remove duplicate data-fetch calls for groups and messages where overlapping hooks are composed.
4. Refresh root README to match actual repository layout.
5. Add backend endpoint for direct image message if frontend feature is intended to be active.
