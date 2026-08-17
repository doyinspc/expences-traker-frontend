// components/Loader.tsx
import React from 'react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: string;
  text?: string;
  textClassName?: string;
  overlay?: boolean;
  blur?: boolean;
  backdropColor?: 'light' | 'dark' | 'transparent';
  reducedMotion?: boolean;
  className?: string;
  id?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  full: 'w-20 h-20',
};

const strokeMap: Record<LoaderSize, string> = {
  xs: '2',
  sm: '2',
  md: '3',
  lg: '4',
  xl: '5',
  full: '6',
};

// Tiny inline className joiner — no external deps
function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'text-blue-600',
  text,
  textClassName,
  overlay = false,
  blur = true,
  backdropColor = 'light',
  reducedMotion = false,
  className,
  id,
}) => {
  const isFullPage = size === 'full' || overlay;
  const motionClass = reducedMotion ? '' : 'animate-spin';
  const sizeClass = sizeMap[size] || sizeMap.md;
  const strokeWidth = strokeMap[size] || '3';

  // Apply className to the overlay backdrop in full-page mode, or directly to the loader element in inline mode
  const iconClassName = isFullPage ? undefined : className;

  const backdropStyles = {
    light: 'bg-white/80',
    dark: 'bg-black/60',
    transparent: 'bg-transparent',
  };

  const defaultTextColor = backdropColor === 'dark' && isFullPage ? 'text-white' : 'text-gray-500';

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <svg
            className={cx(sizeClass, color, motionClass, iconClassName)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth={strokeWidth}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );

      case 'ring':
        return (
          <div className={cx(sizeClass, 'relative', iconClassName)}>
            <div
              className={cx(
                'absolute inset-0 rounded-full border-current border-t-transparent',
                color,
                reducedMotion ? '' : 'animate-spin',
                size === 'xs' || size === 'sm' ? 'border-2' : 'border-4'
              )}
            />
          </div>
        );

      case 'dots':
        return (
          <div className={cx('flex items-center gap-1', iconClassName)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cx(
                  'rounded-full bg-current',
                  color,
                  reducedMotion ? '' : 'animate-bounce',
                  size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
                )}
                style={!reducedMotion ? { animationDelay: `${i * 0.15}s` } : {}}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={cx('flex items-center gap-2', iconClassName)}>
            <div
              className={cx(
                sizeClass,
                'rounded-full bg-current',
                color,
                reducedMotion ? 'opacity-50' : 'animate-pulse'
              )}
            />
          </div>
        );

      case 'bars':
        return (
          <div className={cx('flex items-end gap-0.5 h-4', iconClassName)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cx(
                  'w-1 bg-current rounded-sm',
                  color,
                  reducedMotion ? 'h-2' : 'animate-pulse'
                )}
                style={
                  !reducedMotion
                    ? {
                        height: '100%',
                        animationDelay: `${i * 0.1}s`,
                        transformOrigin: 'bottom',
                      }
                    : { height: '60%' }
                }
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Inline mode (button replacement, inline text indicator)
  if (!isFullPage) {
    return (
      <span
        id={id}
        className="inline-flex items-center gap-2"
        role="status"
        aria-label={text || 'Loading'}
      >
        {renderLoader()}
        {text && <span className={cx('text-sm', textClassName || 'text-gray-500')}>{text}</span>}
      </span>
    );
  }

  // Full-page / overlay mode
  return (
    <div
      id={id}
      className={cx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300',
        backdropStyles[backdropColor],
        blur && 'backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={text || 'Loading content'}
    >
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl">
        {renderLoader()}
        {text && (
          <p
            className={cx(
              'text-center font-medium text-sm',
              textClassName || defaultTextColor
            )}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Specialized Wrappers ─────────────────────────────────────

export const ButtonLoader: React.FC<
  Omit<LoaderProps, 'size' | 'overlay'> & { fullWidth?: boolean }
> = ({ text = 'Loading...', fullWidth = false, className, ...props }) => (
  <Loader
    size="sm"
    text={text}
    className={cx(
      'opacity-80 cursor-wait',
      fullWidth && 'w-full justify-center',
      className
    )}
    {...props}
  />
);

export const SkeletonLoader: React.FC<{ className?: string; lines?: number }> = ({
  className = 'h-4 bg-gray-200 rounded',
  lines = 1,
}) => (
  <div className="space-y-2 animate-pulse" role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cx(className, i === lines - 1 && lines > 1 && 'w-3/4')}
      />
    ))}
  </div>
);

export default Loader;