import React, { useState } from "react";
import { useGroupContext } from "../context/GroupContext.jsx";
import useGroupMembers from "../context/useGroupMembers.js";
import useGetAllUsers from "../context/useGetAllUsers.jsx";
import { MdClose, MdAdd } from "react-icons/md";

function GroupMembers() {
  const { selectedGroup, groupMembers } = useGroupContext();
  const {
    addMember,
    removeMember,
    changeMemberRole,
    loading,
  } = useGroupMembers();
  const [allUsers] = useGetAllUsers();
  const [showAddMember, setShowAddMember] = useState(false);
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));

  const isAdmin = selectedGroup?.members?.some(
    (m) =>
      m.userId._id === authUser.user._id && m.role === "admin"
  );

  const isCreator = selectedGroup?.createdBy === authUser.user._id;

  const availableUsers = allUsers.filter(
    (user) =>
      !groupMembers.some(
        (m) => m.userId._id === user._id
      )
  );

  const handleAddMember = async (userId) => {
    await addMember(userId);
    setShowAddMember(false);
  };

  return (
    <div className="w-full">
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Members ({groupMembers.length})
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn btn-sm btn-primary"
            >
              <MdAdd className="text-lg" /> Add
            </button>
          )}
        </div>

        {showAddMember && availableUsers.length > 0 && (
          <div className="mt-3 p-2 bg-slate-700 rounded">
            {availableUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between py-2 px-2 hover:bg-slate-600 rounded"
              >
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={() => handleAddMember(user._id)}
                  disabled={loading}
                  className="btn btn-xs btn-primary"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 8vh)" }}>
        {groupMembers.map((member) => (
          <div
            key={member.userId._id}
            className="flex items-center justify-between p-4 border-b border-slate-700 hover:bg-slate-800"
          >
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                  <span className="text-xs">
                    {member.userId.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">{member.userId.name}</p>
                <span className="text-xs text-gray-400">
                  {member.role === "admin" ? "Admin" : "Member"}
                </span>
              </div>
            </div>

            {isAdmin &&
              member.userId._id !== authUser.user._id && (
                <div className="flex space-x-2">
                  {member.role === "member" ? (
                    <button
                      onClick={() =>
                        changeMemberRole(member.userId._id, "admin")
                      }
                      disabled={loading}
                      className="btn btn-xs btn-ghost"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        changeMemberRole(member.userId._id, "member")
                      }
                      disabled={loading}
                      className="btn btn-xs btn-ghost"
                    >
                      Demote
                    </button>
                  )}
                  <button
                    onClick={() => removeMember(member.userId._id)}
                    disabled={loading}
                    className="btn btn-xs btn-error"
                  >
                    <MdClose />
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupMembers;
