import { forwardRef, type InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {inputId ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-800 dark:text-neutral-100"
        >
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={[
          'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition',
          'placeholder:text-neutral-400',
          'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
          'dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500',
          'dark:focus:border-violet-400 dark:focus:ring-violet-400/25',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})
