type CommonButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'reset' | 'primary' | 'secondary' | 'danger' | 'search'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function CommonButton({
  onClick,
  label,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
}: CommonButtonProps) {
  const baseStyle = 'px-2 py-1 rounded cursor-pointer border border-black font-bold transition'

  const variants = {
    reset: 'bg-white text-black hover:bg-white-700 disabled:opacity-50',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
    search: 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50',
    secondary: 'bg-gray-300 text-black hover:bg-gray-300 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  }

  const width = fullWidth ? 'w-full' : 'w-auto'

  return (
    <button
      type={type}
      className={`${baseStyle} ${className} ${variants[variant]} ${width}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
