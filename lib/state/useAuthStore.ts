import { observable } from "@legendapp/state";
import { db } from "../db/init";
import { userAuth, userProfile } from "../db/schema";
import { eq } from "drizzle-orm";
import { storage } from "@/lib/storage/mmkv";

// Define types based on schema
type UserAuth = typeof userAuth.$inferSelect;
type UserProfile = typeof userProfile.$inferSelect;

// Define the combined user type
interface User {
  userId: string;
  username: string;
  email: string;
  isVerified: number;
  profile?: {
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

// Define store state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = "auth_user";

// Initialize store with hydrated data if it exists
const storedUser = storage.getString(STORAGE_KEY);
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedUser,
  isLoading: false,
  error: null,
};

// Create the store with proper typing
const _store = observable<AuthState>(initialState);

export const useAuthStore = () => {
  const login = async (username: string, password: string) => {
    try {
      _store.isLoading.set(true);
      _store.error.set(null);

      const result = await db
        .select({
          auth: userAuth,
          profile: userProfile,
        })
        .from(userAuth)
        .leftJoin(userProfile, eq(userAuth.userId, userProfile.userId))
        .where(eq(userAuth.username, username))
        .limit(1);

      const user = result[0];

      if (!user || user.auth.password !== password) {
        throw new Error("Invalid credentials");
      }

      const userData: User = {
        userId: user.auth.userId,
        username: user.auth.username,
        email: user.auth.email,
        isVerified: user.auth.isVerified ?? 0,
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              avatar: user.profile.avatar,
            }
          : undefined,
      };

      // Persist to MMKV
      storage.set(STORAGE_KEY, JSON.stringify(userData));

      _store.user.set(userData);
      _store.isAuthenticated.set(true);
    } catch (error) {
      _store.error.set(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      _store.isLoading.set(false);
    }
  };

  const logout = () => {
    // Clear from MMKV
    storage.delete(STORAGE_KEY);

    _store.user.set(null);
    _store.isAuthenticated.set(false);
    _store.error.set(null);
  };

  const hydrate = () => {
    const storedUser = storage.getString(STORAGE_KEY);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      _store.user.set(userData);
      _store.isAuthenticated.set(true);
    }
  };

  return {
    user: _store.user,
    isAuthenticated: _store.isAuthenticated,
    isLoading: _store.isLoading,
    error: _store.error,
    login,
    logout,
    hydrate,
  } as const;
};

// Export type for use in other components
export type AuthStore = ReturnType<typeof useAuthStore>;
