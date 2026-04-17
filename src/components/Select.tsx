import { forwardRef, type SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  options: readonly string[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, options, placeholder, className = '', ...props },
  ref,
) {
  const selectId = id ?? props.name
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {selectId ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-neutral-800 dark:text-neutral-100"
        >
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={[
          'w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition',
          'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
          'dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50',
          'dark:focus:border-violet-400 dark:focus:ring-violet-400/25',
          'bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})
