/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from "react";

export const SocketContext = createContext<{ socket: any } | null>(null);

export const useSocket = () => useContext(SocketContext);
