import React, { useState } from "react";
import useCreateGroup from "../context/useCreateGroup.js";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";

function CreateGroupModal({ onClose }) {
  const { createGroup, loading, error } = useCreateGroup();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    const result = await createGroup(formData);

    if (result.success) {
      toast.success("Group created successfully!");
      setFormData({ name: "", description: "" });
      onClose();
    } else {
      toast.error(result.error || "Failed to create group");
    }
  };

  return (
    <dialog id="createGroupModal" className="modal">
      <div className="modal-box bg-slate-800 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Create New Group</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Group Name *
            </label>
            <input
              type="text"
              placeholder="Enter group name"
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
              placeholder="Enter group description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="textarea textarea-bordered w-full bg-slate-700"
              rows="3"
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default CreateGroupModal;
