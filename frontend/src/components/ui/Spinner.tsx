import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "inline-block animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] text-primary",
          {
            'h-4 w-4 border-2': size === 'sm',
            'h-8 w-8 border-4': size === 'md',
            'h-12 w-12 border-4': size === 'lg',
          },
          className
        )
      )}
      role="status"
      {...props}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}
