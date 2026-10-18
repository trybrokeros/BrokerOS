import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
const getBaseURL = () => {
  if (apiUrl.startsWith("http")) return apiUrl;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${apiUrl}`;
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${apiUrl}`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL() + "/api/auth",
  plugins: [twoFactorClient()],
});
