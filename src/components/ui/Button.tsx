import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none whitespace-nowrap shrink-0 active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
      md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 h-12',
    };

    const variantStyles = {
      primary:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm dark:bg-rose-500 dark:hover:bg-rose-600',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
