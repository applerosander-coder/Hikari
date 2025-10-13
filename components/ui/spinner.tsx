import { cn } from '@/utils/cn';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const barConfig = {
    sm: { width: '2px', length: '35%' },
    md: { width: '3px', length: '38%' },
    lg: { width: '4px', length: '38%' }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <div className="relative h-full w-full animate-spin">
        {[...Array(8)].map((_, i) => {
          const rotation = i * 45;
          const opacity = 0.2 + (i * 0.1);
          
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 flex items-end justify-center"
              style={{
                transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
                transformOrigin: 'center bottom',
                width: barConfig[size].width,
                height: '50%',
              }}
            >
              <div
                className="rounded-full bg-zinc-600"
                style={{
                  width: '100%',
                  height: barConfig[size].length,
                  opacity,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
