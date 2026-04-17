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

/**
 * Same as {@link SchemaFormComponents} plus an optional `visibleIf` map for declarative,
 * per-field visibility (field name → predicate on watched values).
 */
export type SchemaFormComponentOverrides<TFieldValues extends FieldValues = FieldValues> =
  SchemaFormComponents<TFieldValues> & {
    visibleIf?: Partial<Record<string, (values: TFieldValues) => boolean>>
  }

/** Split `visibleIf` from concrete field-kind components for internal use. */
export function splitSchemaFormComponentOverrides<TFieldValues extends FieldValues>(
  overrides?: SchemaFormComponentOverrides<TFieldValues>,
): {
  kinds: SchemaFormComponents<TFieldValues>
  visibleIf?: Partial<Record<string, (values: TFieldValues) => boolean>>
} {
  if (!overrides) {
    return { kinds: {} }
  }
  const { visibleIf, ...kinds } = overrides
  return { kinds, visibleIf }
}
