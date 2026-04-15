const LOCAL_APP_URL = "http://localhost:3000";
const PRODUCTION_APP_URL = "https://flatdm.lewiscoding.com";

export function getConfiguredAppBaseUrl() {
  return process.env.ENVIRONMENT?.trim().toLowerCase() === "production"
    ? PRODUCTION_APP_URL
    : LOCAL_APP_URL;
}

export function toAppUrl(path: string, baseUrl = getConfiguredAppBaseUrl()) {
  return new URL(path, baseUrl).toString();
}
