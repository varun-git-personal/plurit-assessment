import { useAuthStore } from "@/lib/state/useAuthStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { observer } from "@legendapp/state/react";

export const ProtectedRoute = observer(({ children }) => {
  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      router.replace("/login");
    }
  }, [authStore.isAuthenticated]);

  if (!authStore.isAuthenticated) {
    return null;
  }

  return children;
});
