import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { defaultSchemaFormComponents, SchemaForm } from './lib'
import type {
  SchemaBooleanFieldProps,
  SchemaNumberFieldProps,
  SchemaStringFieldProps,
} from './lib'

const userRoleSchema = z.enum(['admin', 'editor', 'viewer'])

const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').describe('Enter your full name'),
  age: z
    .number()
    .min(18, 'Must be 18 or older')
    .max(120, 'Enter a realistic age')
    .describe('Your age in years'),
  role: userRoleSchema.describe('Pick your access level'),
  joinedAt: z.date().describe('Approximate start date'),
  energyLevel: z
    .number()
    .min(0, 'Min 0')
    .max(100, 'Max 100')
    .describe('How energized are you today? (0–100)'),
  internalNotes: z.string().optional().describe('Only shown when role is Admin'),
  newsletter: z.boolean().describe('Send me occasional product updates'),
})

type ProfileInput = z.input<typeof userProfileSchema>

function EnergySliderField(props: SchemaNumberFieldProps<ProfileInput>) {
  const { name, control, label, placeholder, error } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = typeof field.value === 'number' && !Number.isNaN(field.value) ? field.value : 50
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</label>
              <span className="rounded-md bg-violet-100 px-2 py-0.5 font-mono text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                {value}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-violet-600 dark:bg-neutral-700"
            />
            {placeholder ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{placeholder}</p>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )
      }}
    />
  )
}

function NumberFieldRouter(props: SchemaNumberFieldProps<ProfileInput>) {
  if (props.name === 'energyLevel') {
    return <EnergySliderField {...props} />
  }
  const Fallback = defaultSchemaFormComponents.number
  return <Fallback {...props} />
}

function StringFieldRouter(props: SchemaStringFieldProps<ProfileInput>) {
  if (props.name === 'internalNotes' && props.formValues.role !== 'admin') {
    return null
  }
  const Fallback = defaultSchemaFormComponents.string
  return <Fallback {...props} />
}

function FancySwitchField(props: SchemaBooleanFieldProps<ProfileInput>) {
  const { label, error, registration, placeholder } = props
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/40">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
        <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
          <input type="checkbox" className="peer sr-only" title={placeholder} {...registration} />
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-neutral-300 transition peer-checked:bg-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500 peer-focus-visible:ring-offset-2 dark:bg-neutral-600 dark:peer-checked:bg-violet-500"
            aria-hidden
          />
          <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:left-[calc(100%-1.25rem-0.25rem)]" />
        </span>
      </label>
      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function BooleanFieldRouter(props: SchemaBooleanFieldProps<ProfileInput>) {
  if (props.name === 'newsletter') {
    return <FancySwitchField {...props} />
  }
  const Fallback = defaultSchemaFormComponents.boolean
  return <Fallback {...props} />
}

export default function App() {
  const [submitted, setSubmitted] = useState<z.infer<typeof userProfileSchema> | null>(null)

  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-left sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          react-zod-form-builder
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Demo: schema-driven fields, <strong className="text-neutral-800 dark:text-neutral-200">.describe()</strong>{' '}
          hints, a <strong className="text-neutral-800 dark:text-neutral-200">custom range slider</strong> for{' '}
          <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">energyLevel</code>, a{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">fancy switch</strong> for{' '}
          <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">newsletter</code>, and{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">conditional UI</strong> for{' '}
          <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">internalNotes</code>{' '}
          (returns <code className="font-mono text-xs">null</code> unless role is Admin—powered by{' '}
          <code className="font-mono text-xs">formValues</code>).
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">User profile</h2>
        <SchemaForm
          className="max-w-md"
          schema={userProfileSchema}
          submitLabel="Save profile"
          components={{
            number: NumberFieldRouter,
            string: StringFieldRouter,
            boolean: BooleanFieldRouter,
          }}
          onSubmit={(data) => {
            setSubmitted(data)
          }}
        />
      </section>

      {submitted ? (
        <section
          className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
          aria-live="polite"
        >
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Last submission</h2>
          <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100 dark:bg-black">
            {JSON.stringify(
              submitted,
              (_, v) => (v instanceof Date ? v.toISOString() : v),
              2,
            )}
          </pre>
        </section>
      ) : null}
    </main>
  )
}
