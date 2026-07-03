import Login from "./components/Login.jsx";
import Loading from "./components/Loading.jsx";
import Signup from "./components/Signup.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { MobileViewContext } from "./context/MobileViewContext.jsx";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, lazy, Suspense } from "react";

const Left = lazy(() => import("./home/left/Left"));
const Logout = lazy(() => import("./home/left1/Logout"));
const Right = lazy(() => import("./home/right/Right"));
const IncomingCallModal = lazy(() => import("./components/IncomingCallModal.jsx"));
const VideoCallModal = lazy(() => import("./components/VideoCallModal.jsx"));

function App() {
  const [authUser, , authReady] = useAuth();
  // "list" = show contacts sidebar; "chat" = show chat panel
  const [mobileView, setMobileView] = useState("list");

  if (!authReady) {
    return <Loading />;
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <MobileViewContext.Provider value={{ mobileView, setMobileView }}>
                <div className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-slate-950 md:flex-row">
                  {/* Icon/sidebar control area */}
                  <div className="w-full md:w-auto">
                    <Logout />
                  </div>

                  {/* Contacts list — hidden on mobile when chat is open */}
                  <div
                    className={`
                      ${mobileView === "list" ? "flex" : "hidden"}
                      md:flex
                      w-full md:w-[32%] lg:w-[28%] xl:w-[24%]
                      min-w-0 shrink-0
                    `}
                  >
                    <Left />
                  </div>

                  {/* Chat panel — hidden on mobile when list is shown */}
                  <div
                    className={`
                      ${mobileView === "chat" ? "flex" : "hidden"}
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
      </Suspense>
      <Suspense fallback={null}>
        <IncomingCallModal />
        <VideoCallModal />
      </Suspense>
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
