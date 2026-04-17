import type { ComponentType } from 'react'
import type { Control, FieldValues, Path, UseFormRegisterReturn } from 'react-hook-form'

/** Control type for custom field components (works with `zodResolver` input/output variance). */
export type SchemaFormControl = Control<FieldValues>

export type SchemaStringFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  label: string
  placeholder?: string
  error?: string
  registration: UseFormRegisterReturn<Path<TFieldValues>>
  /** Watched form values — custom renderers can branch on this or return null to hide the field. */
  formValues: TFieldValues
}

export type SchemaNumberFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  control: SchemaFormControl
  label: string
  placeholder?: string
  error?: string
  formValues: TFieldValues
}

export type SchemaBooleanFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  label: string
  placeholder?: string
  error?: string
  registration: UseFormRegisterReturn<Path<TFieldValues>>
  formValues: TFieldValues
}

export type SchemaEnumFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  control: SchemaFormControl
  label: string
  placeholder?: string
  error?: string
  options: readonly string[]
  formValues: TFieldValues
}

export type SchemaDateFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>
  control: SchemaFormControl
  label: string
  placeholder?: string
  error?: string
  formValues: TFieldValues
}

export type SchemaUnsupportedFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: string
  label: string
  placeholder?: string
  zodType: string
  formValues: TFieldValues
}

export type SchemaFormComponents<TFieldValues extends FieldValues = FieldValues> = Partial<{
  string: ComponentType<SchemaStringFieldProps<TFieldValues>>
  number: ComponentType<SchemaNumberFieldProps<TFieldValues>>
  boolean: ComponentType<SchemaBooleanFieldProps<TFieldValues>>
  enum: ComponentType<SchemaEnumFieldProps<TFieldValues>>
  date: ComponentType<SchemaDateFieldProps<TFieldValues>>
  unsupported: ComponentType<SchemaUnsupportedFieldProps<TFieldValues>>
}>
