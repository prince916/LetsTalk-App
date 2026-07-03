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
    <div className="flex h-full min-h-0 flex-col gap-2">
      <h1 className="rounded-md bg-slate-800 px-4 py-2 font-semibold text-white sm:px-8">
        Groups
      </h1>
      <div className="flex-1 min-h-0 overflow-y-auto py-2">
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
