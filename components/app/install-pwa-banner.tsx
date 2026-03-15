"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";

const DISMISS_KEY = "ops-toolkit-install-banner-dismissed-at";
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function hasActiveDismissal() {
  if (typeof window === "undefined") {
    return false;
  }

  const value = window.localStorage.getItem(DISMISS_KEY);
  const dismissedAt = value ? Number(value) : null;

  if (!dismissedAt || Number.isNaN(dismissedAt)) {
    return false;
  }

  if (Date.now() - dismissedAt > DISMISS_WINDOW_MS) {
    window.localStorage.removeItem(DISMISS_KEY);
    return false;
  }

  return true;
}

function addMediaQueryChangeListener(mediaQuery: MediaQueryList, listener: () => void) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

export function InstallPwaBanner() {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobileContext, setIsMobileContext] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setIsInstalled(isStandaloneDisplayMode());
    setIsDismissed(hasActiveDismissal());

    const widthMedia = window.matchMedia("(max-width: 1023px)");
    const coarsePointerMedia = window.matchMedia("(pointer: coarse)");
    const standaloneMedia = window.matchMedia("(display-mode: standalone)");

    const updateMobileContext = () => {
      setIsMobileContext(widthMedia.matches || coarsePointerMedia.matches);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();

      if (isStandaloneDisplayMode()) {
        setIsInstalled(true);
        return;
      }

      setDeferredPrompt(promptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(false);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    const handleStandaloneChange = () => {
      if (isStandaloneDisplayMode()) {
        handleInstalled();
      }
    };

    updateMobileContext();

    const removeWidthListener = addMediaQueryChangeListener(widthMedia, updateMobileContext);
    const removePointerListener = addMediaQueryChangeListener(coarsePointerMedia, updateMobileContext);
    const removeStandaloneListener = addMediaQueryChangeListener(standaloneMedia, handleStandaloneChange);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      removeWidthListener();
      removePointerListener();
      removeStandaloneListener();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (
    !isHydrated ||
    pathname !== "/app" ||
    !isMobileContext ||
    isInstalled ||
    isDismissed ||
    !deferredPrompt
  ) {
    return null;
  }

  return (
    <Card className="border-primary-100 bg-primary-50/75 lg:hidden">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <IconTile icon={Smartphone} tone="blue" />
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-text-primary">Install Ops Toolkit</p>
            <p className="text-sm leading-6 text-text-secondary">
              Add Ops Toolkit to your home screen for faster access and an app-like experience.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            disabled={isInstalling}
            onClick={async () => {
              if (!deferredPrompt) {
                return;
              }

              setIsInstalling(true);

              try {
                await deferredPrompt.prompt();
                const choice = deferredPrompt.userChoice ? await deferredPrompt.userChoice : null;

                if (choice?.outcome === "dismissed") {
                  window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
                  setIsDismissed(true);
                }

                setDeferredPrompt(null);
              } finally {
                setIsInstalling(false);
              }
            }}
          >
            <Download className="h-4 w-4" />
            {isInstalling ? "Opening install" : "Install"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
              setIsDismissed(true);
            }}
          >
            Not now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
