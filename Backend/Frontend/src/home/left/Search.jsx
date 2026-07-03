import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";
import toast from "react-hot-toast";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = allUsers.find((user) =>
      user.name?.toLowerCase().includes(search.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="shrink-0 px-3 pb-2 sm:px-5">
      <form onSubmit={handleSubmit} className="w-full">
        <label className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 shadow-inner shadow-black/20">
          <FaSearch className="text-slate-400" />
          <input
            type="text"
            className="grow bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </form>
    </div>
  );
}

export default Search;