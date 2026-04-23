import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// =============================================================================
// AUTH INSTANCE — LLC-Lanka Issue Tracker Platform
// =============================================================================

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { authConfig as authOptions };

// For backwards compatibility with next-auth v4 style imports
export async function getServerSession() {
  return auth();
}
