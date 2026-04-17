/* eslint-disable react-refresh/only-export-components -- default field registry (not Fast Refresh–optimized) */
import type { FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Checkbox } from '../components/Checkbox'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import type {
  SchemaBooleanFieldProps,
  SchemaDateFieldProps,
  SchemaEnumFieldProps,
  SchemaFormComponents,
  SchemaNumberFieldProps,
  SchemaStringFieldProps,
  SchemaUnsupportedFieldProps,
} from './schemaFormFields'

function DefaultStringField(props: SchemaStringFieldProps<FieldValues>) {
  const { label, placeholder, error, registration } = props
  return <Input label={label} placeholder={placeholder} error={error} {...registration} />
}

function DefaultNumberField(props: SchemaNumberFieldProps<FieldValues>) {
  const { name, control, label, placeholder, error } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          label={label}
          placeholder={placeholder}
          error={error}
          type="number"
          name={field.name}
          onBlur={field.onBlur}
          ref={field.ref}
          value={field.value === undefined || field.value === null ? '' : String(field.value)}
          onChange={(e) => {
            const raw = e.target.value
            field.onChange(raw === '' ? undefined : Number(raw))
          }}
        />
      )}
    />
  )
}

function DefaultBooleanField(props: SchemaBooleanFieldProps<FieldValues>) {
  const { label, placeholder, error, registration } = props
  return <Checkbox label={label} title={placeholder} error={error} {...registration} />
}

function DefaultEnumField(props: SchemaEnumFieldProps<FieldValues>) {
  const { name, control, label, placeholder, error, options } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          label={label}
          placeholder={placeholder}
          error={error}
          options={options}
          name={field.name}
          onBlur={field.onBlur}
          ref={field.ref}
          value={field.value === undefined || field.value === null ? '' : String(field.value)}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
        />
      )}
    />
  )
}

function toDateInputValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  return ''
}

function DefaultDateField(props: SchemaDateFieldProps<FieldValues>) {
  const { name, control, label, placeholder, error } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          label={label}
          placeholder={placeholder}
          error={error}
          type="date"
          name={field.name}
          onBlur={field.onBlur}
          ref={field.ref}
          value={toDateInputValue(field.value)}
          onChange={(e) => {
            const v = e.target.value
            field.onChange(v ? new Date(`${v}T12:00:00`) : undefined)
          }}
        />
      )}
    />
  )
}

function DefaultUnsupportedField({ name, label, zodType }: SchemaUnsupportedFieldProps<FieldValues>) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
      <span className="font-medium">{label}</span>{' '}
      <span className="opacity-80">
        (<code className="rounded bg-black/5 px-1 font-mono text-xs dark:bg-white/10">{name}</code>, Zod{' '}
        <code className="font-mono text-xs">{zodType}</code>) is not supported by the default renderer. Pass{' '}
        <code className="font-mono text-xs">components.unsupported</code> or widen your schema.
      </span>
    </div>
  )
}

export const defaultSchemaFormComponents = {
  string: DefaultStringField,
  number: DefaultNumberField,
  boolean: DefaultBooleanField,
  enum: DefaultEnumField,
  date: DefaultDateField,
  unsupported: DefaultUnsupportedField,
} satisfies SchemaFormComponents<FieldValues>
