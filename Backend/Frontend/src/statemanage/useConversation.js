import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessage: (messages) => set({ messages }),
  // Group conversation support
  selectedGroup: null,
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  groupMessages: [],
  setGroupMessages: (groupMessages) => set({ groupMessages }),
  addGroupMessage: (message) =>
    set((state) => ({
      groupMessages: [...state.groupMessages, message],
    })),
}));
export default useConversation;