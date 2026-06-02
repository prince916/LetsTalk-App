import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import { useAuth } from "./context/AuthProvider.jsx";
import Left from "./home/left/Left";
import Logout from "./home/left1/Logout";
import Right from "./home/right/Right";
import { Routes, Route, Navigate } from "react-router-dom";


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
      
    </>
  );
}

export default App;
