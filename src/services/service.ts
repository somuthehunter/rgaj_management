import { base_url } from "./config";
import endpoints from "@/constants/query_const";

type JsonObject = Record<string, unknown>;

const ACCESS_TOKEN_KEY = "token";
const USER_KEY = "user";
const REFRESH_TOKEN_KEY = "refreshToken";

let refreshPromise: Promise<string | null> | null = null;

const getAuthHeaders = (extra?: Record<string, string>) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(ACCESS_TOKEN_KEY)
      : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  };
};

const clearSessionAndRedirect = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const parseResponse = async (res: Response) => {
  let payload: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    payload = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    payload = text ? { message: text } : null;
  }

  if (!res.ok) {
    const data = payload as JsonObject | null;
    const message =
      (data?.message as string | undefined) ||
      ((data?.error as JsonObject | undefined)?.message as string | undefined) ||
      (data?.error as string | undefined) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message) as Error & {
      status?: number;
      data?: unknown;
    };
    error.status = res.status;
    error.data = payload;
    throw error;
  }

  return payload;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  if (!refreshPromise) {
    refreshPromise ??= (async () => {
      const res = await fetch(base_url + endpoints.auth.refresh, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          refreshToken:
            typeof window !== "undefined"
              ? localStorage.getItem(REFRESH_TOKEN_KEY)
              : null,
        }),
      });

      if (!res.ok) return null;

      const payload = (await res.json().catch(() => null)) as JsonObject | null;
      const data = payload?.data as JsonObject | undefined;
      const nextToken =
        (data?.accessToken as string | undefined) ||
        (payload?.accessToken as string | undefined) ||
        null;

      if (nextToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
      }

      return nextToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const requestService = async (
  endPoint: string,
  init: RequestInit,
  header?: Record<string, string>,
  allowRefresh = true,
) => {
  const url = base_url + endPoint;

  const res = await fetch(url, {
    ...init,
    headers: getAuthHeaders(header),
    credentials: "include",
  });

  if (res.status !== 401) {
    return parseResponse(res);
  }

  const isAuthEndpoint =
    endPoint === endpoints.auth.login || endPoint === endpoints.auth.refresh;

  if (!allowRefresh || isAuthEndpoint) {
    return parseResponse(res);
  }

  const nextToken = await refreshAccessToken();

  if (!nextToken) {
    clearSessionAndRedirect();
    const error = new Error("Unauthorized");
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  const retryRes = await fetch(url, {
    ...init,
    headers: getAuthHeaders(header),
    credentials: "include",
  });

  if (retryRes.status === 401) {
    clearSessionAndRedirect();
  }

  return parseResponse(retryRes);
};

// GET
export const getService = async (
  endPoint: string,
  header?: Record<string, string>
) => {
  return requestService(
    endPoint,
    {
      method: "GET",
    },
    header,
  );
};

// POST
export const postService = async (
  endPoint: string,
  request: object,
  header?: Record<string, string>
) => {
  return requestService(
    endPoint,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    header,
  );
};

// PUT
export const putService = async (
  endPoint: string,
  request: object,
  header?: Record<string, string>
) => {
  return requestService(
    endPoint,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    header,
  );
};

// PATCH
export const patchService = async (
  endPoint: string,
  request: object,
  header?: Record<string, string>
) => {
  return requestService(
    endPoint,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
    header,
  );
};

// DELETE
export const deleteService = async (
  endPoint: string,
  header?: Record<string, string>
) => {
  return requestService(
    endPoint,
    {
      method: "DELETE",
    },
    header,
  );
};
