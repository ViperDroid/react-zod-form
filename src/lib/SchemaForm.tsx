import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
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
  getFieldDescription,
  unwrapToLeaf,
} from './schemaIntrospection'
import type { SchemaFormComponents, SchemaFormControl } from './schemaFormFields'

export type SchemaFormProps<TSchema extends ZodObject<Record<string, ZodType>>> = {
  schema: TSchema
  onSubmit: SubmitHandler<ZodOutput<TSchema>>
  submitLabel?: string
  children?: ReactNode
  /** Tailwind-friendly classes for the root form element. */
  className?: string
  /** Replace built-in field renderers for specific Zod kinds (string, number, boolean, enum, date, unsupported). */
  components?: SchemaFormComponents<ZodInput<TSchema>>
  /**
   * Field names to skip rendering (simple static hide). Values may still exist on the form model;
   * pair with schema design (e.g. optional fields) if validation must change when hidden.
   */
  hiddenFields?: readonly string[]
} & Omit<React.ComponentProps<'form'>, 'onSubmit' | 'children' | 'className'>

function humanizeFieldKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export function SchemaForm<TSchema extends ZodObject<Record<string, ZodType>>>({
  schema,
  onSubmit,
  submitLabel = 'Submit',
  children,
  className,
  components: componentOverrides,
  hiddenFields,
  ...formProps
}: SchemaFormProps<TSchema>) {
  assertZodObject(schema)
  type FormInput = ZodInput<TSchema>
  type FormOutput = ZodOutput<TSchema>

  const shape = schema.shape
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema) as Resolver<FormInput, unknown, FormOutput>,
    defaultValues: buildDefaultValues(shape) as DefaultValues<FormInput>,
  })

  const { control, register, handleSubmit, formState } = form
  const controlLoose = control as unknown as SchemaFormControl
  const formValues = (useWatch({ control }) ?? {}) as FormInput

  const c = {
    string: componentOverrides?.string ?? defaultSchemaFormComponents.string,
    number: componentOverrides?.number ?? defaultSchemaFormComponents.number,
    boolean: componentOverrides?.boolean ?? defaultSchemaFormComponents.boolean,
    enum: componentOverrides?.enum ?? defaultSchemaFormComponents.enum,
    date: componentOverrides?.date ?? defaultSchemaFormComponents.date,
    unsupported:
      componentOverrides?.unsupported ?? defaultSchemaFormComponents.unsupported,
  }

  const fields = (Object.keys(shape) as (keyof typeof shape & string)[]).map((name) => {
    if (hiddenFields?.includes(name)) {
      return null
    }
    const fieldSchema = shape[name]!
    const leaf = unwrapToLeaf(fieldSchema)
    const kind = fieldKindFromLeaf(leaf)
    const error = formState.errors[name as keyof typeof formState.errors]?.message as
      | string
      | undefined
    const describe = getFieldDescription(fieldSchema, leaf)
    const label = humanizeFieldKey(name)
    const placeholder = describe

    if (kind === 'string') {
      const Cmp = c.string
      return (
        <Cmp
          key={name}
          name={name as Path<FormInput>}
          label={label}
          placeholder={placeholder}
          error={error}
          registration={register(name as Path<FormInput>)}
          formValues={formValues}
        />
      )
    }

    if (kind === 'number') {
      const Cmp = c.number
      return (
        <Cmp
          key={name}
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          formValues={formValues}
        />
      )
    }

    if (kind === 'boolean') {
      const Cmp = c.boolean
      return (
        <Cmp
          key={name}
          name={name as Path<FormInput>}
          label={label}
          placeholder={placeholder}
          error={error}
          registration={register(name as Path<FormInput>)}
          formValues={formValues}
        />
      )
    }

    if (kind === 'enum') {
      const Cmp = c.enum
      const options = enumOptions(leaf)
      return (
        <Cmp
          key={name}
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          options={options}
          formValues={formValues}
        />
      )
    }

    if (kind === 'date') {
      const Cmp = c.date
      return (
        <Cmp
          key={name}
          name={name as Path<FormInput>}
          control={controlLoose}
          label={label}
          placeholder={placeholder}
          error={error}
          formValues={formValues}
        />
      )
    }

    const Cmp = c.unsupported
    return (
      <Cmp
        key={name}
        name={name}
        label={label}
        placeholder={placeholder}
        zodType={leaf.type}
        formValues={formValues}
      />
    )
  })

  const formClassName = ['space-y-5', className].filter(Boolean).join(' ')

  return (
    <form {...formProps} className={formClassName} onSubmit={handleSubmit(onSubmit)} noValidate>
      {fields}
      {children}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 active:bg-violet-700 sm:w-auto dark:bg-violet-500 dark:hover:bg-violet-400 dark:focus-visible:outline-violet-400 dark:active:bg-violet-600"
      >
        {submitLabel}
      </button>
    </form>
  )
}
