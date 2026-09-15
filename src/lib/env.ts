const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);

const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ?? "https://phoenixsystems.online/property_api",
);

const apiPrefix = ensureLeadingSlash(import.meta.env.VITE_API_PREFIX ?? "/api/v1");

export const env = {
  apiBaseUrl,
  apiPrefix,
  apiRoot: `${apiBaseUrl}${apiPrefix}`,
} as const;
