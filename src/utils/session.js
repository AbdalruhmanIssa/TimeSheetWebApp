import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "timesheet_token";

function userFromToken(token) {
  try {
    const claims = jwtDecode(token);
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
    return {
      id: claims.Id,
      userName: claims.Name,
      fullName: claims.FullName || claims.Name,
      email: claims.Email,
      role: Array.isArray(claims.Role) ? claims.Role[0] : claims.Role,
      expiresAt: claims.exp * 1000,
    };
  } catch {
    return null;
  }
}

export function readSession() {
  let token = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    /* storage blocked: stay logged out */
  }
  const user = token ? userFromToken(token) : null;
  if (!user) {
    clearSession();
    return { token: null, user: null };
  }
  return { token, user };
}

export function saveSession(token) {
  const user = userFromToken(token);
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked: the session lasts until the tab closes */
  }
  return { token, user };
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}
