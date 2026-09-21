import { getAccessToken } from "@/utils/authStorage.js";

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const requestApi = async (
  path,
  options = {},
  { requireAuth = false, errorMessage = "요청에 실패했습니다." } = {},
) => {
  const headers = new Headers(options.headers || {});

  if (requireAuth && !headers.has("Authorization")) {
    const token = getAccessToken();
    if (!token) {
      throw new Error("로그인이 필요합니다.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data?.message || errorMessage);
  }

  return data;
};
