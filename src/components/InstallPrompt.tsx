import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Check if user dismissed before
    const dismissed = localStorage.getItem("itstime.install.dismissed");
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      if (dismissedAt > threeDaysAgo) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      // Show banner after 5 seconds for iOS
      setTimeout(() => setShowBanner(true), 5000);
      return;
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("itstime.install.dismissed", new Date().toISOString());
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-20 inset-x-4 z-50 animate-slide-up">
        <div className="mx-auto max-w-md bg-gradient-card border border-primary/30 rounded-2xl p-4 shadow-glow backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 grid place-items-center shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Add to Home Screen</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Install It's Time for the full app experience with offline access and alarm notifications.
              </p>
            </div>
            <button onClick={handleDismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex-1 rounded-lg bg-gradient-primary text-primary-foreground py-2 text-sm font-medium shadow-glow"
              >
                Show me how
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="flex-1 rounded-lg bg-gradient-primary text-primary-foreground py-2 text-sm font-medium shadow-glow"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 rounded-lg border border-border py-2 text-sm text-muted-foreground"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 shadow-elegant animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIOSGuide(false)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center shrink-0 text-sm font-bold text-primary">1</div>
                <div>
                  <div className="font-medium text-sm">Tap the Share button</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    Look for the <Share className="h-3 w-3 inline" /> icon at the bottom of Safari
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center shrink-0 text-sm font-bold text-primary">2</div>
                <div>
                  <div className="font-medium text-sm">Scroll down and tap "Add to Home Screen"</div>
                  <div className="text-xs text-muted-foreground mt-0.5">You may need to scroll the action sheet</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center shrink-0 text-sm font-bold text-primary">3</div>
                <div>
                  <div className="font-medium text-sm">Tap "Add" to confirm</div>
                  <div className="text-xs text-muted-foreground mt-0.5">The app will appear on your home screen</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
              className="mt-5 w-full rounded-lg bg-gradient-primary text-primary-foreground py-2.5 text-sm font-medium shadow-glow"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
