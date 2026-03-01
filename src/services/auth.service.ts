import { postService, getService } from "./service";
import endpoints from "@/constants/query_const";

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