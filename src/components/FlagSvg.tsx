import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

interface FlagSvgProps {
  code: string;
  className?: string;
  title?: string;
  hideLabel?: boolean;
}

export const FlagSvg: React.FC<FlagSvgProps> = ({ code, className = '', title, hideLabel = false }) => {
  const c = code.toUpperCase();
  const FlagComponent = (
    Flags as Record<string, React.ComponentType<{ className?: string; title?: string; 'aria-hidden'?: boolean }>>
  )[c];
  const resolvedTitle = hideLabel ? undefined : title || c;

  return (
    <div
      className={`relative inline-block overflow-hidden rounded-md shadow-md border border-slate-700/60 bg-slate-900 aspect-[3/2] ${className}`}
      title={resolvedTitle}
      role="img"
      aria-label={hideLabel ? 'Country flag' : resolvedTitle}
    >
      {FlagComponent ? (
        <FlagComponent
          className="w-full h-full block object-cover"
          title={resolvedTitle}
          aria-hidden={hideLabel || undefined}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-mono text-xs font-bold">
          {hideLabel ? '?' : c}
        </div>
      )}
      {/* Subtle realistic fabric weave highlight / shadow gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10"
        aria-hidden="true"
      />
    </div>
  );
};
