import React, { useState } from 'react';
import {
  Download,
  CheckCircle,
  Share,
  PlusSquare,
  Monitor,
  Smartphone,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone mode
  if (isInstalled && variant === 'header') {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-[11px] font-medium text-emerald-400">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // If browser hasn't fired beforeinstallprompt (iOS Safari, Firefox, iframe preview, or already dismissed)
      setShowGuideModal(true);
    }
  };

  // Header compact button
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-900/40 transition-all cursor-pointer whitespace-nowrap ${className}`}
          title="Install Keystone Study as a standalone desktop or mobile application"
        >
          {installSuccess ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Install</span>
              <span className="hidden sm:inline">Install App</span>
            </>
          )}
        </button>

        {showGuideModal && (
          <InstallInstructionsModal
            isIOS={isIOS}
            isInIframe={isInIframe}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </>
    );
  }

  // Settings view variant
  if (variant === 'settings') {
    return (
      <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/20 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <h5 className="font-semibold text-white text-xs">
                {isInstalled ? 'Keystone App Installed' : 'Install Keystone to Desktop / Phone'}
              </h5>
            </div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Launch directly from your dock or home screen with full offline capability, zero browser address bar clutter, and fast native-like performance.
            </p>
          </div>
          {isInstalled && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-900/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Keystone Studio</span>
          </button>
        )}

        {showGuideModal && (
          <InstallInstructionsModal
            isIOS={isIOS}
            isInIframe={isInIframe}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </div>
    );
  }

  // Banner variant for home / dashboard
  return (
    <>
      <div className="p-4 rounded-2xl border border-indigo-800/40 bg-gradient-to-r from-indigo-950/40 via-[#111726] to-[#131b2e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Install Keystone Study App</span>
              <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/60 px-1.5 py-0.2 rounded border border-indigo-700/50">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enjoy offline access, background focus audio, and distraction-free full-screen workspace.
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isInstalled ? 'Open Standalone' : 'Install App'}
        </button>
      </div>

      {showGuideModal && (
        <InstallInstructionsModal
          isIOS={isIOS}
          isInIframe={isInIframe}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
};

interface InstallInstructionsModalProps {
  isIOS: boolean;
  isInIframe: boolean;
  onClose: () => void;
}

const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({
  isIOS,
  isInIframe,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be restricted in some embedded contexts
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Install Keystone Study</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Close install instructions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isInIframe ? (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-amber-950/35 border border-amber-700/50 space-y-1.5">
              <p className="font-semibold text-amber-200">
                Open in a standalone tab first
              </p>
              <p className="text-amber-100/80 text-[11px] leading-relaxed">
                This app is currently running inside an embedded preview frame. Using the browser&apos;s install menu here installs the outer host page instead of <strong>Keystone Study</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <p className="font-semibold text-white">1. Open Keystone in its own tab</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Launch the app directly in a new browser tab so your browser detects Keystone&apos;s manifest and icon.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm shadow-indigo-900/40"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open App in New Tab</span>
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy App URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <p className="font-semibold text-white">2. Click &ldquo;Install App&rdquo; in the new tab</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isIOS
                  ? 'In the new Safari tab, tap Share and select "Add to Home Screen".'
                  : 'Once opened in its own tab, click "Install App" in the Keystone header (or the install icon in that tab\'s address bar).'}
              </p>
            </div>
          </div>
        ) : isIOS ? (
          /* iOS Safari Instructions */
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 shrink-0">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">1. Tap the Share button</p>
                <p className="text-slate-400 text-[11px]">
                  Located at the bottom of your Safari browser bar on iPhone (or top right on iPad).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 shrink-0">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">2. Tap &ldquo;Add to Home Screen&rdquo;</p>
                <p className="text-slate-400 text-[11px]">
                  Scroll down the share sheet actions and select <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-emerald-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">3. Tap &ldquo;Add&rdquo;</p>
                <p className="text-slate-400 text-[11px]">
                  Confirm the app name. Keystone will appear on your home screen with its custom icon.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Chrome / Edge / Android Instructions */
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">Desktop (Chrome / Edge / Brave)</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click the <strong>Install</strong> icon in the address bar (right side of URL), or open the browser menu (<strong>⋮</strong>) and click <strong>&ldquo;Install Keystone Study...&rdquo;</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">Android (Chrome)</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Tap the three dots (<strong>⋮</strong>) in the top right and select <strong>&ldquo;Install App&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
