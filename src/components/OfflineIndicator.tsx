import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-600/60 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Offline Mode — All changes remain cached and saved locally.</span>
    </div>
  );
};
