import type {
  ZodCatch,
  ZodDefault,
  ZodNullable,
  ZodNonOptional,
  ZodObject,
  ZodOptional,
  ZodPipe,
  ZodPrefault,
  ZodReadonly,
  ZodSuccess,
  ZodType,
} from 'zod'

export type FieldKind = 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'unsupported'

const META_STEP = /(?:^|[\s,|])step:\s*(\d+)/i
const META_COLS = /(?:^|[\s,|])cols:\s*(\d+)/i

/** Prefer `.describe()` on the field or its unwrapped leaf (Zod v3/v4). */
export function getFieldDescription(fieldSchema: ZodType, leaf: ZodType): string | undefined {
  return fieldSchema.description ?? leaf.description
}

/**
 * Reads `step:N` from a `.describe()` string (e.g. `Account email | step:2`).
 * Used with {@link SchemaFormProps.currentStep} to show only fields for that wizard step.
 */
export function getFieldStepFromDescription(description: string | undefined): number | undefined {
  if (!description) return undefined
  const m = description.match(META_STEP)
  if (!m) return undefined
  const n = Number.parseInt(m[1]!, 10)
  return Number.isNaN(n) || n < 1 ? undefined : n
}

/**
 * Reads `cols:N` from a `.describe()` string for Tailwind grid span (`col-span-N`).
 * N is clamped between 1 and 12.
 */
export function getFieldColsFromDescription(description: string | undefined): number | undefined {
  if (!description) return undefined
  const m = description.match(META_COLS)
  if (!m) return undefined
  const n = Number.parseInt(m[1]!, 10)
  if (Number.isNaN(n) || n < 1) return undefined
  return Math.min(n, 12)
}

/**
 * Removes `step:` and `cols:` metadata tokens from a describe string so the remainder
 * can be used as a human-visible placeholder or hint.
 */
export function stripLayoutMetaFromDescription(description: string | undefined): string | undefined {
  if (!description) return undefined
  let s = description.replace(META_STEP, ' ').replace(META_COLS, ' ')
  s = s.replace(/[\s,|]{2,}/g, ' ').replace(/^[\s,|]+|[\s,|]+$/g, '').trim()
  return s.length > 0 ? s : undefined
}

export function unwrapToLeaf(schema: ZodType): ZodType {
  let current: ZodType = schema
  for (;;) {
    const t = current.type
    switch (t) {
      case 'optional':
        current = (current as ZodOptional<ZodType>).unwrap()
        continue
      case 'nullable':
        current = (current as ZodNullable<ZodType>).unwrap()
        continue
      case 'default':
      case 'prefault':
        current = (current as ZodDefault<ZodType> | ZodPrefault<ZodType>).unwrap()
        continue
      case 'nonoptional':
        current = (current as ZodNonOptional<ZodType>).unwrap()
        continue
      case 'success':
        current = (current as ZodSuccess<ZodType>).unwrap()
        continue
      case 'readonly':
        current = (current as ZodReadonly<ZodType>).unwrap()
        continue
      case 'catch':
        current = (current as ZodCatch<ZodType>).unwrap()
        continue
      case 'pipe':
        current = (current as ZodPipe<ZodType, ZodType>).in
        continue
      default:
        return current
    }
  }
}

export function fieldKindFromLeaf(leaf: ZodType): FieldKind {
  switch (leaf.type) {
    case 'string':
      return 'string'
    case 'number':
    case 'int':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'enum':
      return 'enum'
    case 'date':
      return 'date'
    default:
      return 'unsupported'
  }
}

export function enumOptions(leaf: ZodType): string[] {
  if (leaf.type !== 'enum') return []
  const e = leaf as unknown as { options: readonly (string | number)[] }
  return e.options.map((v) => String(v))
}

export function buildDefaultValues(shape: Record<string, ZodType>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(shape)) {
    const leaf = unwrapToLeaf(shape[key]!)
    const kind = fieldKindFromLeaf(leaf)
    switch (kind) {
      case 'string':
        out[key] = ''
        break
      case 'number':
        out[key] = undefined
        break
      case 'boolean':
        out[key] = false
        break
      case 'enum': {
        const opts = enumOptions(leaf)
        out[key] = opts[0] ?? ''
        break
      }
      case 'date':
        out[key] = undefined
        break
      default:
        out[key] = undefined
    }
  }
  return out
}

export function assertZodObject(schema: ZodType): asserts schema is ZodObject<Record<string, ZodType>> {
  if (schema.type !== 'object') {
    throw new Error('SchemaForm requires a Zod object schema at the root (e.g. z.object({ ... })).')
  }
}
