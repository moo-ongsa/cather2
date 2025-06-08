const params = {
  baseUrl: "/api/",
};

const headers = {
  "Content-Type": "application/json",
};
const withLogging = async (url, init) => {
  return await fetch(params.baseUrl + url, init)
    .then((response) => response.json())
    .then((data) => {
      console.log("[LOGGER] data:", data);
      return data;
    })
    .catch((error) => {
      console.log("[LOGGER] error:", error);
    });
};

const api = {
  get: (url, init = {}) =>
    withLogging(url, { ...init, ...headers, method: "GET" }),
  delete: (url, init = {}) =>
    withLogging(url, { ...init, ...headers, method: "DELETE" }),
  post: (url, init = {}) =>
    withLogging(url, { ...init, ...headers, method: "POST" }),
  patch: (url, init = {}) =>
    withLogging(url, { ...init, ...headers, method: "PATCH" }),
  put: (url, init = {}) =>
    withLogging(url, { ...init, ...headers, method: "PUT" }),
};

export default api;
