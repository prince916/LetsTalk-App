import React, { useState } from "react";
import Search from "./Search.jsx";
import Users from "./Users.jsx";
import Groups from "./Groups.jsx";
import CreateGroupModal from "../../components/CreateGroupModal.jsx";
import { MdAdd } from "react-icons/md";

function Left() {
  const [tab, setTab] = useState("users"); // "users" or "groups"

  return (
    <div className="w-full bg-black text-gray-300 flex flex-col h-dvh min-h-dvh">
      <h1 className="font-bold text-2xl md:text-3xl p-2 px-4 md:px-11">Chats</h1>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="tabs tabs-boxed bg-slate-800">
          <button
            onClick={() => setTab("users")}
            className={`tab ${tab === "users" ? "tab-active" : ""}`}
          >
            Direct
          </button>
          <button
            onClick={() => setTab("groups")}
            className={`tab ${tab === "groups" ? "tab-active" : ""}`}
          >
            Groups
          </button>
        </div>
        {tab === "groups" && (
          <button
            onClick={() =>
              document.getElementById("createGroupModal").showModal()
            }
            className="btn btn-sm btn-primary"
          >
            <MdAdd className="text-lg" /> New
          </button>
        )}
      </div>

      <Search />
      <div className="flex-1 overflow-y-auto">
        {tab === "users" ? <Users /> : <Groups />}
      </div>

      <CreateGroupModal onClose={() => {}} />
    </div>
  );
}

export default Left;