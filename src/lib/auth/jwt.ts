import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback-secret-change-in-production"
);

export interface JWTPayload {
  userId: string;
  role: string;
  email?: string;
  [key: string]: string | undefined;
}

export async function createToken(payload: JWTPayload, expiresIn = "1h"): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function decodeToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length === 3 && parts[1]) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return payload as JWTPayload;
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}
