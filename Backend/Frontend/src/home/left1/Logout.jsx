import { useState } from "react";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function Logout() {
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/logout");
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
    <div className="flex w-full items-center justify-between border-b border-white/10 bg-slate-950 px-3 py-2 text-white shadow-sm shadow-black/20 md:h-full md:w-14 md:min-w-14 md:flex-col md:justify-end md:border-b-0 md:border-r md:px-0 md:py-3">
      <div className="flex items-center gap-2 md:flex-col md:gap-3">
        <div className="hidden h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/15 text-sm font-semibold text-sky-300 md:flex">
          LT
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-slate-800 md:h-12 md:w-12"
          aria-label="Logout"
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : <TbLogout2 className="text-xl md:text-2xl" />}
        </button>
      </div>
    </div>
  );
}
export default Logout;