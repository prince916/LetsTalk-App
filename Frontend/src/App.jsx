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

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <div className="flex h-screen overflow-auto">
                <Logout></Logout>
                <Left></Left>
                <Right></Right>

                
              </div>
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
