import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, ShieldCheck, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { adManager } from '../utils/admob';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleMute,
  hapticsEnabled,
  onToggleHaptics,
  onResetProgress,
  onClose,
}) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleOpenAdPrivacy = async () => {
    const opened = await adManager.openPrivacyOptions();
    if (!opened) {
      setPrivacyStatus('Ad privacy choices appear on supported Android regions.');
      setTimeout(() => setPrivacyStatus(null), 3000);
    }
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onResetProgress();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl animate-pop text-left my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Settings & Privacy</h2>
            <p className="text-xs text-slate-400">World Flags Challenge · v1.0</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preferences */}
        <div className="space-y-2.5 mb-5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div className="text-left">
                <span className="text-sm font-semibold text-white block">Sound Effects</span>
                <span className="text-xs text-slate-400">Answer chimes and timer alerts</span>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold ${isMuted ? 'text-slate-500' : 'text-emerald-400'}`}>
              {isMuted ? 'OFF' : 'ON'}
            </span>
          </button>

          {/* Haptics Toggle */}
          <button
            onClick={onToggleHaptics}
            className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone className={`w-5 h-5 shrink-0 ${hapticsEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="text-sm font-semibold text-white block">Haptic Feedback</span>
                <span className="text-xs text-slate-400">Tactile vibration on taps and streaks</span>
              </div>
            </div>
            <span className={`text-xs font-mono font-bold ${hapticsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {hapticsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Ad Privacy Preferences (Google UMP GDPR/EEA Compliance) */}
          <button
            onClick={handleOpenAdPrivacy}
            className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-left">
                <span className="text-sm font-semibold text-white block">Ad Privacy Choices</span>
                <span className="text-xs text-slate-400">Manage Google AdMob consent settings</span>
              </div>
            </div>
          </button>

          {privacyStatus && (
            <p className="text-xs text-slate-400 px-1">{privacyStatus}</p>
          )}

          {/* Expandable In-App Privacy Policy */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowPrivacyPolicy((v) => !v)}
              className="w-full min-h-[52px] px-4 py-3 hover:bg-slate-800/60 flex items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-300 shrink-0" />
                <span className="text-sm font-semibold text-white">Privacy Policy</span>
              </div>
              {showPrivacyPolicy ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showPrivacyPolicy && (
              <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-800/80">
                <p>
                  <strong className="text-white">Local Data Only:</strong> World Flags Challenge does not require an account and does not collect personal information such as your name, email, or location. High scores, daily streaks, and mastered flags are stored locally on your device.
                </p>
                <p>
                  <strong className="text-white">Advertising (Google AdMob):</strong> This app uses Google AdMob to display banner, interstitial, and optional rewarded video ads. Google may use device advertising identifiers in accordance with Google&apos;s Privacy Policy and your regional consent choices.
                </p>
                <p>
                  <strong className="text-white">Data Deletion:</strong> You can clear all local game progress at any time using the Reset Progress button below or by uninstalling the app.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reset Progress (2-Tap Safety Confirmation) */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleResetClick}
            className={`w-full min-h-[48px] px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              confirmReset
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmReset ? 'Tap Again to Permanently Reset Progress' : 'Reset All Progress'}</span>
          </button>
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="w-full mt-2 min-h-[40px] text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
