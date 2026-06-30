import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import { GroupProvider } from "./context/GroupContext.jsx";
import { CallProvider } from "./context/CallContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <GroupProvider>
            <App />
          </GroupProvider>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
