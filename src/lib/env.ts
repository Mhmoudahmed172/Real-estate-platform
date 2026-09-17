const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return trimTrailingSlash(configured);
  if (import.meta.env.PROD) {
    throw new Error("VITE_API_BASE_URL must be configured for production builds.");
  }
  return "http://localhost:8000";
}

const apiBaseUrl = getApiBaseUrl();

const apiPrefix = ensureLeadingSlash(import.meta.env.VITE_API_PREFIX ?? "/api/v1");

export const env = {
  apiBaseUrl,
  apiPrefix,
  apiRoot: `${apiBaseUrl}${apiPrefix}`,
} as const;
