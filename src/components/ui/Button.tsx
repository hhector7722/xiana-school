'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'h-8 px-3.5 text-xs rounded-lg',
    md: 'h-10 px-5 text-sm rounded-xl',
  }

  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus:outline-none active:scale-[0.98]'

  const styles = {
    primary:
      'bg-accent text-white hover:bg-accent-hover active:bg-accent-active focus:ring-2 focus:ring-accent/20',
    secondary:
      'bg-white text-gray-700 border border-[#ECECEC] hover:border-gray-300 hover:text-gray-900 focus:ring-2 focus:ring-accent/20',
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${styles[variant]} ${className}`}
      aria-disabled={props.disabled ? true : undefined}
      {...props}
    >
      {children}
    </button>
  )
}
