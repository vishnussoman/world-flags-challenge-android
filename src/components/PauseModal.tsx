import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-pop text-center">
        <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-2">Game Paused</h2>
        <p className="text-sm text-slate-400 mb-6">Take a breath or resume when you're ready.</p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Challenge</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Sound Effects: {isMuted ? 'Off' : 'On'}</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Main Menu</span>
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Esc</kbd> to resume
        </div>
      </div>
    </div>
  );
};
