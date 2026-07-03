import { createContext, useContext } from "react";

export const GroupContext = createContext();

export const useGroupContext = () => useContext(GroupContext);
