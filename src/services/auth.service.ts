import { postService } from "./service";
import auth from "@/constants/query_const";

export type LoginPayload = {
  email: string;
  password: string;
};

export const loginUser = (data: LoginPayload) => {
  return postService(auth.login, data);
};