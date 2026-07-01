import Loading from "./components/Loading.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import { useAuth } from "./context/AuthProvider.jsx";
import Left from "./home/left/Left";
import Logout from "./home/left1/Logout";
import Right from "./home/right/Right";
import toast, { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import IncomingCallModal from "./components/IncomingCallModal.jsx";
import VideoCallModal from "./components/VideoCallModal.jsx";
import { createContext, useContext, useState } from "react";

// Mobile view context: controls whether the list or chat is visible on small screens
export const MobileViewContext = createContext(null);
export const useMobileView = () => useContext(MobileViewContext);

function App() {
  const [authUser, setAuthUser] = useAuth();
  // "list" = show contacts sidebar; "chat" = show chat panel
  const [mobileView, setMobileView] = useState("list");
  console.log(authUser);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <MobileViewContext.Provider value={{ mobileView, setMobileView }}>
                <div className="flex h-dvh min-h-dvh overflow-hidden bg-slate-950">
                  {/* Icon sidebar — always visible */}
                  <Logout />

                  {/* Contacts list — hidden on mobile when chat is open */}
                  <div
                    className={`
                      ${
                        mobileView === "list"
                          ? "flex"
                          : "hidden"
                      }
                      md:flex
                      w-full md:w-[30%] lg:w-[27%]
                      shrink-0
                    `}
                  >
                    <Left />
                  </div>

                  {/* Chat panel — hidden on mobile when list is shown */}
                  <div
                    className={`
                      ${
                        mobileView === "chat"
                          ? "flex"
                          : "hidden"
                      }
                      md:flex
                      flex-1 min-w-0
                    `}
                  >
                    <Right />
                  </div>
                </div>
              </MobileViewContext.Provider>
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to={"/"} /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to={"/"} /> : <Signup />}
        />
      </Routes>
      <IncomingCallModal />
      <VideoCallModal />
      <Toaster />
    </>
  );
}

export default App;


                 {/* <div className="drawer">
                  <input
                    id="my-drawer-1"
                    type="checkbox"
                    className="drawer-toggle"
                  />
                  <div className="drawer-content">
                    {/* Page content here */}
                //     <label htmlFor="my-drawer-1" className="btn drawer-button">
                //       Open drawer
                //     </label>
                //   </div>
                //   <div className="drawer-side">
                //     <label
                //       htmlFor="my-drawer-1"
                //       aria-label="close sidebar"
                //       className="drawer-overlay"
                //     ></label>
                //     <ul className="menu bg-base-200 min-h-full w-80 p-4">
                //       {/* Sidebar content here */}
                //       <li>
                //         <a>Sidebar Item 1</a>
                //       </li>
                //       <li>
                //         <a>Sidebar Item 2</a>
                //       </li>
                //     </ul>
                //   </div>
                // </div> */}
