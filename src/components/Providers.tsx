"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../contexts/AuthContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Read Google client ID from Next.js client-exposed env var or fallback to current workspace's ID
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "964337329488-ja0434ptermubtlpa4anp60nhrgdjvh9.apps.googleusercontent.com";

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Suppress duplicate Google login initialize calls (often caused by HMR / Fast Refresh in development)
    const interval = setInterval(() => {
      const win = window as any;
      if (
        win.google &&
        win.google.accounts &&
        win.google.accounts.id
      ) {
        const idObj = win.google.accounts.id;
        if (!idObj.__wrapped) {
          const origInit = idObj.initialize;
          let initializedClientId: string | null = null;
          
          idObj.initialize = function (config: any) {
            if (initializedClientId === config.client_id) {
              // Ignore duplicate initialization calls for the same client ID
              return;
            }
            initializedClientId = config.client_id;
            return origInit.call(this, config);
          };
          
          idObj.__wrapped = true;
          clearInterval(interval);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
