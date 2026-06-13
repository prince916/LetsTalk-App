import React, { useState } from "react";
import { useGroupContext } from "../context/GroupContext.jsx";
import useGroupActions from "../context/useGroupActions.js";
import useGroup from "../statemanage/useGroup.js";
import { MdEdit, MdDelete, MdLogout } from "react-icons/md";
import toast from "react-hot-toast";

function GroupSettings() {
  const { selectedGroup } = useGroupContext();
  const { setSelectedGroup: setGroupState } = useGroup();
  const { updateGroup, deleteGroup, loading } = useGroupActions();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: selectedGroup?.name || "",
    description: selectedGroup?.description || "",
  });
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));

  const isCreator = selectedGroup?.createdBy?._id === authUser.user._id ||
                    selectedGroup?.createdBy === authUser.user._id;
  const isAdmin = selectedGroup?.members?.some(
    (m) => (m.userId?._id === authUser.user._id || m.userId === authUser.user._id) && m.role === "admin"
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await updateGroup(formData);
    if (result.success) {
      toast.success("Group updated!");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update group");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      const result = await deleteGroup();
      if (result.success) {
        toast.success("Group deleted");
        setGroupState(null);
      } else {
        toast.error(result.error || "Failed to delete group");
      }
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{selectedGroup?.name}</h2>

      {isEditing && isAdmin ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input input-bordered w-full bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="textarea textarea-bordered w-full bg-slate-700"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? <span className="loading loading-spinner"></span> : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300">{selectedGroup?.description || "No description"}</p>

          <div className="flex space-x-2">
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-info"
              >
                <MdEdit /> Edit
              </button>
            )}

            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="btn btn-sm btn-error"
              >
                <MdDelete /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupSettings;
