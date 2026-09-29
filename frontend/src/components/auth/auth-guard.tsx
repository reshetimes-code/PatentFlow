"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Zustand's persist middleware only rehydrates from localStorage on the
// client, and its `.persist` API is unavailable during SSR — subscribing via
// useSyncExternalStore (rather than useState+useEffect) lets React reconcile
// the server/client hydration mismatch correctly without ever touching
// `.persist` while rendering on the server.
function subscribe(callback: () => void) {
  const api = useAuthStore.persist;
  if (!api) return () => {};
  return api.onFinishHydration(callback);
}

function getHydratedSnapshot() {
  return useAuthStore.persist?.hasHydrated() ?? true;
}

function getServerSnapshot() {
  return false;
}

/** Client-side gate for the (dashboard) route group: redirects to /auth when
 * there is no locally-issued JWT. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribe, getHydratedSnapshot, getServerSnapshot);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
