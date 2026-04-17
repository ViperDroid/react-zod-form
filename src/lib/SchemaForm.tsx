import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useForm,
  useWatch,
  type DefaultValues,
  type Path,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import type { input as ZodInput, output as ZodOutput, ZodObject, ZodType } from 'zod'
import { defaultSchemaFormComponents } from './defaultSchemaFormComponents'
import {
  assertZodObject,
  buildDefaultValues,
  enumOptions,
  fieldKindFromLeaf,
  getFieldColsFromDescription,
  getFieldDescription,
  getFieldStepFromDescription,
  stripLayoutMetaFromDescription,
  unwrapToLeaf,
} from './schemaIntrospection'
import type { SchemaFormComponentOverrides, SchemaFormControl } from './schemaFormFields'
import { splitSchemaFormComponentOverrides } from './schemaFormFields'

function colSpanClass(cols: number | undefined): string {
  if (!cols || cols <= 1) return ''
  const map: Record<number, string> = {
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  }
  return map[cols] ?? 'col-span-2'
}

function humanizeFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

/**
 * Props for `SchemaForm`. `onSubmit` receives Zod’s **output** type (after transforms),
 * matching `z.infer<typeof schema>`.
 */
export type SchemaFormProps<TSchema extends ZodObject<Record<string, ZodType>>> = {
  /**
   * Root Zod object schema; each key becomes a field. Use `.describe()` for hints and optional
   * layout tokens (`step:N`, `cols:N`). See `AI_USAGE_GUIDE.md` in the repo root for Cursor/agent workflows.
   */
  schema: TSchema

  /**
   * Called with validated data when the native submit event succeeds. Typed as
   * `SubmitHandler<z.output<typeof schema>>`.
   */
  onSubmit: SubmitHandler<ZodOutput<TSchema>>

  /**
   * Label for the built-in submit control (ignored when `showSubmitButton` is `false`).
   * @defaultValue `"Submit"`
   */
  submitLabel?: string

  /**
   * Extra nodes rendered **after** generated fields and **before** the submit button
   * (e.g. wizard “Next” with `type="button"`).
   */
  children?: ReactNode

  /**
   * Additional Tailwind (or other) classes merged onto the root `<form>` (after internal layout).
   */
  className?: string

  /**
   * Replace default renderers per Zod **kind** (`string`, `number`, …). Optionally include
   * **`visibleIf`**: a map of **field name → predicate** on watched values; return `false` to hide
   * that field (runs after `hiddenFields` and step filtering).
   */
  components?: SchemaFormComponentOverrides<ZodInput<TSchema>>

  /**
   * Static list of object keys to never render. Values may still exist in RHF; align Zod
   * (optional fields, refinements) if validation must change when hidden.
   */
  hiddenFields?: readonly string[]

  /**
   * When set, only fields whose `.describe()` includes `step:`**`N`** matching this value are shown.
   * Fields **without** `step:` metadata appear on **every** step. When `undefined`, all fields render.
   */
  currentStep?: number

  /**
   * Renders the library’s primary submit button. Set to `false` to hide it and provide your own
   * controls (e.g. a multi-step “Next” / “Back” row) via `children`.
   * @defaultValue `true`
   */
  showSubmitButton?: boolean

  /**
   * Disables the submit button and sets `aria-busy` while an async `onSubmit` is in flight
   * (set from the parent while awaiting).
   */
  isLoading?: boolean

  /**
   * When `true`, shows a success banner and soft-disables the submit button (until reset by parent).
   */
  isSuccess?: boolean

  /**
   * Copy for the success banner when `isSuccess` is `true`.
   * @defaultValue `"Form submitted successfully."`
   */
  successMessage?: string

  /**
   * Shown on the submit button while `isLoading` is `true`.
   * @defaultValue `"Submitting…"`
   */
  loadingLabel?: string

  /**
   * Shallow-merged on top of the library’s inferred defaults from the schema (empty strings,
   * `false` for booleans, etc.). Use for **edit forms** and server-loaded rows.
   *
   * React Hook Form only reads `defaultValues` on first mount unless you reset — when
   * `resetKey` changes, `SchemaForm` calls `reset()` with a fresh merge so async loads work
   * without remounting the whole tree.
   */
  defaultValues?: Partial<ZodInput<TSchema>>

  /**
   * When this value **changes** (strict `!==` from the previous render), the form is
   * `reset()` with `{ ...inferredDefaults, ...defaultValues }`. Typical pattern: `resetKey={row.id}`
   * or `resetKey={dataVersion}` after a fetch completes.
   */
  resetKey?: string | number

  /**
   * Render order for fields that appear in this list (first wins). Any schema keys **not**
   * listed are appended in their original object key order. Unknown names are ignored.
   */
  fieldOrder?: readonly string[]

  /**
   * Non-field error from your server or API (e.g. “Email already registered”). Rendered as an
   * alert above the submit area; clear it from parent state when the user edits or retries.
   */
  submitError?: string | null
} & Omit<React.ComponentProps<'form'>, 'onSubmit' | 'children' | 'className'>

export function SchemaForm<TSchema extends ZodObject<Record<string, ZodType>>>({
  schema,
  onSubmit,
  submitLabel = 'Submit',
  children,
  className,
  components: componentOverrides,
  hiddenFields,
  currentStep,
  showSubmitButton = true,
  isLoading = false,
  isSuccess = false,
  successMessage = 'Form submitted successfully.',
  loadingLabel = 'Submitting…',
  defaultValues: defaultValuesProp,
  resetKey,
  fieldOrder,
  submitError,
  ...formProps
}: SchemaFormProps<TSchema>) {
  assertZodObject(schema)
  type FormInput = ZodInput<TSchema>
  type FormOutput = ZodOutput<TSchema>

  const shape = schema.shape

  const mergeDefaults = useCallback((): FormInput => {
    return {
      ...(buildDefaultValues(shape) as FormInput),
      ...(defaultValuesProp ?? {}),
    }
  }, [shape, defaultValuesProp])

  const initialDefaults = useMemo(() => mergeDefaults(), [mergeDefaults])

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema) as Resolver<FormInput, unknown, FormOutput>,
    defaultValues: initialDefaults as DefaultValues<FormInput>,
  })

  const { control, register, handleSubmit, formState, reset } = form
  const controlLoose = control as unknown as SchemaFormControl
  const formValues = (useWatch({ control }) ?? {}) as FormInput

  const prevResetKeyRef = useRef(resetKey)
  useEffect(() => {
    if (prevResetKeyRef.current === resetKey) return
    prevResetKeyRef.current = resetKey
    reset(mergeDefaults())
  }, [resetKey, mergeDefaults, reset])

  const { kinds: overrideKinds, visibleIf: componentVisibleIf } =
    splitSchemaFormComponentOverrides(componentOverrides as SchemaFormComponentOverrides<FormInput>)

  const c = {
    string: overrideKinds.string ?? defaultSchemaFormComponents.string,
    number: overrideKinds.number ?? defaultSchemaFormComponents.number,
    boolean: overrideKinds.boolean ?? defaultSchemaFormComponents.boolean,
    enum: overrideKinds.enum ?? defaultSchemaFormComponents.enum,
    date: overrideKinds.date ?? defaultSchemaFormComponents.date,
    unsupported: overrideKinds.unsupported ?? defaultSchemaFormComponents.unsupported,
  }

  const keys = Object.keys(shape) as (keyof typeof shape & string)[]

  const orderedKeys = useMemo(() => {
    if (!fieldOrder?.length) return keys
    const set = new Set(keys)
    const head = fieldOrder.filter((n): n is (typeof keys)[number] => set.has(n as (typeof keys)[number]))
    const rest = keys.filter((k) => !head.includes(k))
    return [...head, ...rest]
  }, [keys, fieldOrder])

  const usesColumnGrid = useMemo(() => {
    const sh = schema.shape as Record<string, ZodType>
    return Object.keys(sh).some((name) => {
      const leaf = unwrapToLeaf(sh[name]!)
      const raw = getFieldDescription(sh[name]!, leaf)
      return getFieldColsFromDescription(raw) != null
    })
  }, [schema])

  const fields = orderedKeys.map((name) => {
    if (hiddenFields?.includes(name)) {
      return null
    }

    const fieldSchema = shape[name]!
    const leaf = unwrapToLeaf(fieldSchema)
    const rawDescribe = getFieldDescription(fieldSchema, leaf)

    if (currentStep !== undefined) {
      const stepMeta = getFieldStepFromDescription(rawDescribe)
      if (stepMeta !== undefined && stepMeta !== currentStep) {
        return null
      }
    }

    const predicate = componentVisibleIf?.[name as string]
    if (predicate && !predicate(formValues)) {
      return null
    }

    const kind = fieldKindFromLeaf(leaf)
    const error = formState.errors[name as keyof typeof formState.errors]?.message as
      | string
      | undefined
    const label = humanizeFieldKey(name)
    const placeholder = stripLayoutMetaFromDescription(rawDescribe)
    const cols = getFieldColsFromDescription(rawDescribe)
    const cellClass = colSpanClass(cols)

    const wrap = (node: ReactNode) => (
      <div key={name} className={cellClass || undefined}>
        {node}
      </div>
    )

    if (kind === 'string') {
      const Cmp = c.string
      return wrap(
        <Cmp
          name={name as Path<FormInput>}
          label={label}
          placeholder={placeholder}
          error={error}
          registration={register(name as Path<FormInput>)}
          formValues={formValues}
        />,
      )
    }

    if (kind === 'number') {
      const Cmp = c.number
      return wrap(
        <Cmp
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          formValues={formValues}
        />,
      )
    }

    if (kind === 'boolean') {
      const Cmp = c.boolean
      return wrap(
        <Cmp
          name={name as Path<FormInput>}
          label={label}
          placeholder={placeholder}
          error={error}
          registration={register(name as Path<FormInput>)}
          formValues={formValues}
        />,
      )
    }

    if (kind === 'enum') {
      const Cmp = c.enum
      const options = enumOptions(leaf)
      return wrap(
        <Cmp
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          options={options}
          formValues={formValues}
        />,
      )
    }

    if (kind === 'date') {
      const Cmp = c.date
      return wrap(
        <Cmp
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          formValues={formValues}
        />,
      )
    }

    const Cmp = c.unsupported
    return wrap(
      <Cmp
        name={name}
        label={label}
        placeholder={placeholder}
        zodType={leaf.type}
        formValues={formValues}
      />,
    )
  })

  const formClassName = ['flex flex-col gap-4', className].filter(Boolean).join(' ')
  const fieldsWrapperClass = usesColumnGrid
    ? 'grid grid-cols-2 gap-x-4 gap-y-5'
    : 'flex flex-col gap-5'

  return (
    <form {...formProps} className={formClassName} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div
        className={[
          fieldsWrapperClass,
          isSuccess || isLoading ? 'pointer-events-none opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {fields}
      </div>

      {isSuccess ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {successMessage}
        </div>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-950 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
        >
          {submitError}
        </div>
      ) : null}

      {children}

      {showSubmitButton ? (
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          aria-busy={isLoading || undefined}
          className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 enabled:active:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-violet-500 dark:hover:bg-violet-400 dark:focus-visible:outline-violet-400 dark:enabled:active:bg-violet-600"
        >
          {isLoading ? loadingLabel : submitLabel}
        </button>
      ) : null}
    </form>
  )
}
