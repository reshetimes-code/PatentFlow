"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import Script from "next/script";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const PLACEHOLDER_VALUES = new Set(["", "your-google-client-id", "your-google-client-id.apps.googleusercontent.com"]);

export function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const configured = !PLACEHOLDER_VALUES.has(clientId.trim().toLowerCase());
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!configured || !scriptReady || !containerRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => onCredential(response.credential),
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 336,
      locale,
    });
  }, [configured, scriptReady, clientId, locale, onCredential]);

  if (!configured) {
    return (
      <div
        className="w-full h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs text-neutral-500"
        title="Set NEXT_PUBLIC_GOOGLE_CLIENT_ID / GOOGLE_CLIENT_ID to enable Google Sign-In"
      >
        Google Sign-In not configured
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="w-full flex justify-center [&>div]:w-full" />
    </>
  );
}
