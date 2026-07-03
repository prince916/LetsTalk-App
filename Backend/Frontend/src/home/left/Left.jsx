import { useState } from "react";
import Search from "./Search.jsx";
import Users from "./Users.jsx";
import Groups from "./Groups.jsx";
import CreateGroupModal from "../../components/CreateGroupModal.jsx";
import { MdAdd } from "react-icons/md";

function Left() {
  const [tab, setTab] = useState("users");

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-white/10 bg-slate-950/95 text-slate-200">
      <div className="border-b border-white/10 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">Messages</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Chats</h1>
          </div>
          <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            Online now
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-5">
        <div className="flex flex-1 rounded-2xl border border-white/10 bg-slate-900/80 p-1">
          <button
            onClick={() => setTab("users")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${tab === "users" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/10" : "text-slate-400 hover:text-white"}`}
          >
            Direct
          </button>
          <button
            onClick={() => setTab("groups")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${tab === "groups" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/10" : "text-slate-400 hover:text-white"}`}
          >
            Groups
          </button>
        </div>
        {tab === "groups" && (
          <button
            onClick={() => document.getElementById("createGroupModal").showModal()}
            className="btn btn-sm h-9 rounded-2xl border-0 bg-sky-500/90 text-white hover:bg-sky-400"
          >
            <MdAdd className="text-lg" /> New
          </button>
        )}
      </div>

      <Search />
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
        {tab === "users" ? <Users /> : <Groups />}
      </div>

      <CreateGroupModal onClose={() => {}} />
    </div>
  );
}

export default Left;