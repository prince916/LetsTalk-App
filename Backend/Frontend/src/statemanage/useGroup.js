import { create } from "zustand";

const useGroup = create((set) => ({
  selectedGroup: null,
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  groups: [],
  setGroups: (groups) => set({ groups }),
  groupMessages: [],
  setGroupMessages: (groupMessages) => set({ groupMessages }),
  addGroupMessage: (message) =>
    set((state) => ({
      groupMessages: [...state.groupMessages, message],
    })),
  clearGroupMessages: () => set({ groupMessages: [] }),
}));

export default useGroup;
