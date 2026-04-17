import { forwardRef, type InputHTMLAttributes } from 'react'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className = '', title, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          title={title}
          aria-invalid={error ? true : undefined}
          className={[
            'mt-0.5 size-4 shrink-0 rounded border-neutral-300 text-violet-600 accent-violet-600',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500',
            'dark:border-neutral-600 dark:bg-neutral-950',
          ].join(' ')}
          {...props}
        />
        {inputId ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-snug text-neutral-800 dark:text-neutral-100"
          >
            {label}
          </label>
        ) : (
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
        )}
      </div>
      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})
