const API_BASE_URL = "http://localhost:5000/api";

let interceptorInstalled = false;
let refreshPromise = null;

const AUTH_BYPASS_PATHS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/reactivate",
  "/api/auth/refresh",
];

const toUrlString = (input) => {
  if (typeof input === "string") return input;
  if (input instanceof Request) return input.url;
  return "";
};

const isApiRequest = (url) => {
  return url.startsWith(API_BASE_URL) || url.startsWith("/api/");
};

const isBypassAuthPath = (url) => {
  return AUTH_BYPASS_PATHS.some((path) => url.includes(path));
};

const dispatchAuthFailure = () => {
  window.dispatchEvent(
    new CustomEvent("auth:logout-required", {
      detail: { reason: "refresh_failed" },
    }),
  );
};

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const requestTokenRefresh = async (nativeFetch) => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("refresh token missing");
      }

      const response = await nativeFetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("refresh request failed");
      }

      const payload = await response.json();
      const nextAccess = payload.accessToken || payload.token;
      const nextRefresh = payload.refreshToken;

      if (!nextAccess || !nextRefresh) {
        throw new Error("refresh response is invalid");
      }

      localStorage.setItem("token", nextAccess);
      localStorage.setItem("refreshToken", nextRefresh);
      return nextAccess;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const installAuthFetchInterceptor = () => {
  if (interceptorInstalled || typeof window === "undefined") return;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const { __authRetried, ...fetchInit } = init;
    const url = toUrlString(input);
    const apiRequest = isApiRequest(url);

    const headers = new Headers(
      fetchInit.headers ||
        (input instanceof Request ? input.headers : undefined),
    );

    if (apiRequest && !isBypassAuthPath(url) && !headers.has("Authorization")) {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await nativeFetch(input, {
      ...fetchInit,
      headers,
    });

    if (
      response.status !== 401 ||
      __authRetried ||
      !apiRequest ||
      isBypassAuthPath(url)
    ) {
      return response;
    }

    try {
      const refreshedAccessToken = await requestTokenRefresh(nativeFetch);
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${refreshedAccessToken}`);

      return nativeFetch(input, {
        ...fetchInit,
        headers: retryHeaders,
      });
    } catch (error) {
      clearAuthStorage();
      dispatchAuthFailure();
      return response;
    }
  };

  interceptorInstalled = true;
};
