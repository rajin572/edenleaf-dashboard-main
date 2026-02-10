import { ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getBrandCookie, removeBrandCookie } from "@/utils/brandCookies";
import { toast } from "sonner";
import { SocketContext } from "./socket-context";
import { decodedToken } from "../utils/jwt";
import { getSocketUrl } from "../helpers/config/socket-config";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState<string | undefined>();

  // Track token change — this picks up token after login
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = getBrandCookie("accessToken");
      setToken((prevToken) =>
        prevToken !== currentToken ? currentToken : prevToken
      );
    }, 1000); // check every 1s — adjust if needed

    return () => clearInterval(interval);
  }, []);

  // Create socket when token is set and valid
  useEffect(() => {
    if (!token) return;

    const user = decodedToken(token);
    if (!user) {
      removeBrandCookie("accessToken");
      toast.error("Invalid token. Please log in again.");
      return;
    }

    const socketInstance = io(getSocketUrl(), {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () =>
      console.log("Connected to socket server")
    );
    socketInstance.on("disconnect", () =>
      console.error("Disconnected from socket server")
    );
    socketInstance.on("connect_error", (error) =>
      console.error(`Connection error: ${error.message}`)
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
