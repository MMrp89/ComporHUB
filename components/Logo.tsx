import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light'; // 'dark' = fundo escuro (compor branco + HUB laranja) | 'light' = fundo claro (compor escuro + HUB laranja)
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSymbolOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  className = '',
  size = 'md',
  showSymbolOnly = false,
}) => {
  const isDark = variant === 'dark';

  // Sizing styles
  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const dotSizes = {
    sm: { r: 2.5, gap: 'gap-1', w: 'w-4' },
    md: { r: 3.5, gap: 'gap-1', w: 'w-5' },
    lg: { r: 4.5, gap: 'gap-1.5', w: 'w-6' },
    xl: { r: 5.5, gap: 'gap-2', w: 'w-8' },
  };

  if (showSymbolOnly) {
    return (
      <svg
        viewBox="0 0 36 30"
        className={`${size === 'sm' ? 'h-5' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-10'} w-auto inline-block ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Compor HUB"
      >
        <circle cx="10" cy="8" r="6" fill="#EA721D" />
        <circle cx="26" cy="8" r="6" fill="#EA721D" />
        <circle cx="18" cy="22" r="6" fill="#EA721D" />
      </svg>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none font-sans font-black tracking-tighter leading-none ${className}`}
    >
      {/* "compor" */}
      <span
        className={`${textSizes[size]} font-black ${
          isDark ? 'text-white' : 'text-[#222222]'
        } tracking-[-0.04em]`}
        style={{ fontFamily: "system-ui, -apple-system, 'Montserrat', 'Segoe UI', Roboto, sans-serif" }}
      >
        compor
      </span>

      {/* 3 Orange Dots Icon - Floating elevated between compor & HUB */}
      <div className="inline-flex flex-col items-center justify-center mx-1.5 self-start pt-0.5">
        <svg
          viewBox="0 0 34 28"
          className={`${size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : size === 'lg' ? 'h-5' : 'h-6'} w-auto`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="7" r="5.5" fill="#EA721D" />
          <circle cx="25" cy="7" r="5.5" fill="#EA721D" />
          <circle cx="17" cy="20.5" r="5.5" fill="#EA721D" />
        </svg>
      </div>

      {/* "HUB" */}
      <span
        className={`${textSizes[size]} font-black text-[#EA721D] tracking-normal`}
        style={{ fontFamily: "system-ui, -apple-system, 'Montserrat', 'Segoe UI', Roboto, sans-serif" }}
      >
        HUB
      </span>
    </div>
  );
};

export default Logo;
