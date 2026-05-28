import Signup from "./components/Signup.jsx";
import Left from "./home/left/Left";
import Logout from "./home/left1/Logout";
import Right from "./home/right/Right";

export default function () {
  return (
    <>
      {/* <div className="flex h-screen overflow-auto">
        <Logout></Logout>
        <Left></Left>
        <Right></Right>
      </div> */}
      <Signup ></Signup>
    </>
  );
}
