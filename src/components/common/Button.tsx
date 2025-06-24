type CommonButtonProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
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
  const baseStyle = 'px-4 py-2 rounded cursor-pointer border border-black font-medium transition'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
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
