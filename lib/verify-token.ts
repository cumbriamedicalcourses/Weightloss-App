import { createRemoteJWKSet, jwtVerify } from "jose";

// Google publishes the keys that sign Firebase ID tokens at this address.
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

/**
 * Checks the Firebase ID token on an API request and returns the user id.
 * Returns null when the token is missing or invalid.
 *
 * When Firebase is not configured the app is in preview mode. API calls are
 * then allowed only outside production, so a half-configured live site can
 * never expose the paid AI endpoint to the public.
 */
export async function verifyRequest(req: Request): Promise<string | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return process.env.NODE_ENV === "production" ? null : "preview";

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
