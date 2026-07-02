import React from "react";
import User from "./User.jsx";
import useGetAllUsers from "../../context/useGetAllUsers.jsx";

function Users() {
  const [allUsers, loading] = useGetAllUsers();

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between px-3">
        <h2 className="text-sm font-semibold text-slate-300">Recent chats</h2>
        <span className="text-xs text-slate-500">{allUsers.length} contacts</span>
      </div>

      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mx-2 h-16 animate-pulse rounded-2xl border border-white/5 bg-slate-800/70" />
          ))
        ) : allUsers.length > 0 ? (
          allUsers.map((user, index) => <User key={index} user={user} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-4 text-center text-sm text-slate-400">
            No contacts available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;