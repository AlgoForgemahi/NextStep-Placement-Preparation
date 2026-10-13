import axios from "axios";
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 120000,
});
let csrfPromise;
api.interceptors.request.use(async (config) => {
  if (!["get", "head", "options"].includes(config.method || "get")) {
    csrfPromise ??= axios
      .get("/api/auth/csrf", { withCredentials: true, timeout: 10000 })
      .then((r) => r.data)
      .catch((e) => {
        csrfPromise = null;
        throw e;
      });
    const csrf = await csrfPromise;
    config.headers[csrf.header] = csrf.token;
  }
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 403) csrfPromise = null;
    return Promise.reject(
      Error(
        ((!e.response || (e.response.status >= 500 && !e.response.data?.message))
          ? "Cannot reach the application server. Start the database and backend with scripts/start-local.ps1, then try again."
          : e.response?.data?.message) ||
          "The server could not complete this request. Please try again.",
      ),
    );
  },
);
export function resetCsrf() {
  csrfPromise = null;
}
export function download(name, value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
