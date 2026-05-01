import { postService, getService } from "./service";
import endpoints from "@/constants/query_const";
import { User } from "@/types";
import { normalizeSessionUser } from "./session.service";

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null;

export const extractAuthSession = (payload: unknown) => {
  const root = isObject(payload) ? payload : {};
  const data = isObject(root.data) ? root.data : {};
  const nestedUser = isObject(data.user) ? data.user : null;
  const directUser = isObject(root.user) ? root.user : null;

  const rawUser = (nestedUser ?? directUser ?? (Object.keys(data).length ? data : null)) as
    | User
    | null;

  const accessToken =
    (typeof data.accessToken === "string" ? data.accessToken : undefined) ||
    (typeof root.accessToken === "string" ? root.accessToken : undefined) ||
    (typeof data.token === "string" ? data.token : undefined) ||
    (typeof root.token === "string" ? root.token : undefined) ||
    null;

  const refreshToken =
    (typeof data.refreshToken === "string" ? data.refreshToken : undefined) ||
    (typeof root.refreshToken === "string" ? root.refreshToken : undefined) ||
    null;

  return {
    user: rawUser ? normalizeSessionUser(rawUser) : null,
    accessToken,
    refreshToken,
  };
};

export const extractProfileUser = (payload: unknown) => {
  const root = isObject(payload) ? payload : {};
  const data = isObject(root.data) ? root.data : {};
  const nestedUser = isObject(data.user) ? data.user : null;
  const directUser = isObject(root.user) ? root.user : null;
  const rawUser = (nestedUser ?? directUser ?? (Object.keys(data).length ? data : null)) as
    | User
    | null;

  return rawUser ? normalizeSessionUser(rawUser) : null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const loginUser = (data: LoginPayload) => {
  return postService(endpoints.auth.login, data);
};

export const getProfile = () => {
  return getService(endpoints.auth.profile);
};

export const logoutUser = () => {
  return postService(endpoints.auth.logout, {});
};
