const KEYS = {
  accessToken: "tf.auth.token",
  refreshToken: "tf.auth.refreshToken",
  user: "tf.auth.user",
};

const LEGACY_KEYS = {
  accessToken: "token",
  refreshToken: "refreshToken",
  user: "user",
};

const read = (key) => localStorage.getItem(key);
const write = (key, value) => localStorage.setItem(key, value);
const remove = (key) => localStorage.removeItem(key);

const parseUser = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  read(KEYS.accessToken) || read(LEGACY_KEYS.accessToken);

export const setAccessToken = (token) => {
  if (!token) return;
  write(KEYS.accessToken, token);
  write(LEGACY_KEYS.accessToken, token);
};

export const getRefreshToken = () =>
  read(KEYS.refreshToken) || read(LEGACY_KEYS.refreshToken);

export const setRefreshToken = (token) => {
  if (!token) return;
  write(KEYS.refreshToken, token);
  write(LEGACY_KEYS.refreshToken, token);
};

export const getStoredUser = () => {
  const raw = read(KEYS.user) || read(LEGACY_KEYS.user);
  return parseUser(raw);
};

export const setStoredUser = (user) => {
  if (!user) return;
  const serialized = JSON.stringify(user);
  write(KEYS.user, serialized);
  write(LEGACY_KEYS.user, serialized);
};

export const clearAuthStorage = () => {
  remove(KEYS.accessToken);
  remove(KEYS.refreshToken);
  remove(KEYS.user);
  remove(LEGACY_KEYS.accessToken);
  remove(LEGACY_KEYS.refreshToken);
  remove(LEGACY_KEYS.user);
};
