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
      <div className="modal-box animate-fade-in w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-0 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Create New Group</h3>
            <p className="text-sm text-slate-400">Bring friends together in one shared space.</p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-slate-300 hover:bg-slate-800">
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Group Name *</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered w-full border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Description</label>
            <textarea
              placeholder="Enter group description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea textarea-bordered w-full border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500"
              rows="3"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn border-0 bg-sky-500 text-white hover:bg-sky-400">
              {loading ? <span className="loading loading-spinner"></span> : "Create"}
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
