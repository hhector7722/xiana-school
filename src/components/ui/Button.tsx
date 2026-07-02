'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl h-10 px-5 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus:outline-none active:scale-[0.98]'

  const styles = {
    primary:
      'bg-accent text-white hover:bg-accent-hover active:bg-accent-active focus:ring-2 focus:ring-accent/20',
    secondary:
      'bg-white text-gray-700 border border-[#ECECEC] hover:border-gray-300 hover:text-gray-900 focus:ring-2 focus:ring-accent/20',
  }

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      aria-disabled={props.disabled ? true : undefined}
      {...props}
    >
      {children}
    </button>
  )
}
