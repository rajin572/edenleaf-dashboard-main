import Cookies from "js-cookie";

const cookieName = (suffix: string) => `ednleaf_main_${suffix}`;
const legacyCookieName = (suffix: string) => `eCommerce_main_${suffix}`;

export const getBrandCookie = (suffix: string) =>
  Cookies.get(cookieName(suffix)) ?? Cookies.get(legacyCookieName(suffix));

export const setBrandCookie = (suffix: string, value: string, options?: Parameters<typeof Cookies.set>[2]) => {
  Cookies.set(cookieName(suffix), value, options);
  Cookies.remove(legacyCookieName(suffix), { path: "/" });
};

// Matches the backend refresh-token lifetime (JWT_REFRESH_EXPIRES_IN = 30d). Every
// refresh re-issues both, so an actively used session keeps sliding forward.
export const setAccessTokenCookie = (token: string) =>
  setBrandCookie("accessToken", token, { path: "/", expires: 30, secure: false });

export const removeBrandCookie = (suffix: string) => {
  Cookies.remove(cookieName(suffix), { path: "/" });
  Cookies.remove(legacyCookieName(suffix), { path: "/" });
};
