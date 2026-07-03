import { createContext, useContext } from "react";

export const MobileViewContext = createContext(null);

export const useMobileView = () => useContext(MobileViewContext);
