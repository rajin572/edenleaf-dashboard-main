/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";

export const decodedToken = (token: string): any => {
  return jwtDecode(token);
};
