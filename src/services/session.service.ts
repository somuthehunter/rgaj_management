import { normalizeRole } from "@/lib/auth";
import { User, UserRole } from "@/types";

const USER_KEY = "user";
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const SESSION_VALIDATED_AT_KEY = "sessionValidatedAt";

type StoredUser = User & {
  role: UserRole;
};

const buildDisplayName = (user: Partial<User>) => {
  const fullName = [user.firstName, user.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  return fullName || user.name || user.email || "";
};

export const normalizeSessionUser = (user: User) => {
  const role = normalizeRole(user.role);

  if (!role) {
    throw new Error("Unsupported user role received from server.");
  }

  return {
    ...user,
    role,
    storeId: user.storeId ?? null,
    name: buildDisplayName(user),
  } as StoredUser;
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    const parsed = JSON.parse(user) as User;
    const normalized = normalizeSessionUser(parsed);

    if (!normalized.id || !normalized.name || !normalized.email) {
      clearSession();
      return null;
    }

    return normalized;
  } catch {
    clearSession();
    return null;
  }
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getLastSessionValidation = () => {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(SESSION_VALIDATED_AT_KEY);
  if (!value) return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const markSessionValidated = (timestamp = Date.now()) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_VALIDATED_AT_KEY, String(timestamp));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_VALIDATED_AT_KEY);
};

export const setAccessToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const setRefreshToken = (refreshToken: string | null | undefined) => {
  if (typeof window === "undefined") return;

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return;
  }

  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setSession = (
  user: User,
  token: string,
  refreshToken?: string | null,
) => {
  if (typeof window === "undefined") return;

  const normalizedUser = normalizeSessionUser(user);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(normalizedUser),
  );
  setAccessToken(token);

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  markSessionValidated();
};
