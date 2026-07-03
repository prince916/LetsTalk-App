import GroupItem from "./GroupItem.jsx";
import { useGroupContext } from "../../context/GroupStateContext.jsx";
import useGetAllGroups from "../../context/useGetAllGroups.js";

function Groups() {
  const { groups, loading } = useGroupContext();
  useGetAllGroups();

  if (loading) {
    return (
      <div className="flex flex-col gap-2 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="px-8 py-2 text-white font-semibold bg-slate-800 rounded-md">
        Groups
      </h1>
      <div
        className="py-2 flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(84vh - 10vh)" }}
      >
        {groups && groups.length > 0 ? (
          groups.map((group) => <GroupItem key={group._id} group={group} />)
        ) : (
          <div className="text-center py-4 text-gray-400">
            No groups yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
}

export default Groups;
