import React, { useState } from "react";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function Logout() {
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/user/logout");
      localStorage.removeItem("ChatApp");
      Cookies.remove("jwt");
      setLoading(false);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      console.log("Error in Logout", error);
      toast.error("Error in logging out");
    }
  };
  return (
    <>
      <div className="w-10 md:w-[4%] min-w-[2.5rem] bg-slate-950 text-white flex flex-col justify-end flex-shrink-0">
        <div className="p-1 md:p-3 align-bottom">
          <button>
            <TbLogout2
              className="text-3xl md:text-5xl p-1 md:p-2 hover:bg-gray-600 rounded-lg duration-300"
              onClick={handleLogout}
            />
          </button>
        </div>
      </div>
    </>
  );
}
export default Logout;