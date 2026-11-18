import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Shared module-level state so no component ever misses an early beforeinstallprompt event
let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedDeferredPrompt = null;
    notifyListeners();
  });
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function checkIsInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    sharedDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(checkIsStandalone);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(checkIsInIframe);

  useEffect(() => {
    setIsInstalled(checkIsStandalone());
    setIsInIframe(checkIsInIframe());

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const syncPrompt = () => {
      setDeferredPrompt(sharedDeferredPrompt);
      setIsInstalled(checkIsStandalone());
    };

    listeners.add(syncPrompt);
    // Sync immediately in case event fired between render and effect
    syncPrompt();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => setIsInstalled(checkIsStandalone());
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    const handleAppInstalled = () => {
      sharedDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      listeners.delete(syncPrompt);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    const promptEvent = deferredPrompt || sharedDeferredPrompt;
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      sharedDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      notifyListeners();
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isInIframe,
    install,
    deferredPrompt
  };
}
