import { createContext, useContext } from "react";

export const CallContext = createContext();

export const useCallContext = () => useContext(CallContext);
