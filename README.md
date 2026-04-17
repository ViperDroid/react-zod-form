# react-zod-form-builder

Build **type-safe** forms from **Zod** object schemas with **React Hook Form**—minimal wiring, strong inference on `onSubmit`, and escape hatches when you need custom UI.

---

## Features

- **Zero-boilerplate mode** — pass a `z.object` schema and an `onSubmit` handler; fields are inferred and typed end-to-end.
- **Zod `.describe()`** — used for placeholders (and checkbox `title` hints); labels stay friendly (derived from the field key).
- **`components` overrides** — swap renderers per Zod kind (`string`, `number`, `boolean`, `enum`, `date`, `unsupported`).
- **`className` on `SchemaForm`** — style the root form with Tailwind (or anything else) in your app.
- **Shipped CSS** — default primitives use utility classes bundled into `style.css` (no Tailwind setup required in consuming apps).
- **`hiddenFields`** — skip rendering named keys (static hide); combine with schema design if validation must change when a field is not shown.
- **`formValues` on every field renderer** — watched values from React Hook Form so custom components can branch or **`return null`** to hide a field reactively.
- **Multi-step** — put `step:N` in `.describe()` and pass **`currentStep`**; fields without `step:` stay visible on every step.
- **Grid spans** — put `cols:N` in `.describe()` to apply Tailwind `col-span-N` inside an auto 2-column grid.
- **Loading / success** — **`isLoading`**, **`isSuccess`**, and customizable **`loadingLabel`** / **`successMessage`** on `SchemaForm`.
- **AI guide** — see **`AI_USAGE_GUIDE.md`** for Cursor/agent-oriented workflows and a copy-paste “golden prompt”.

### Tests

```bash
npm test
```

Vitest + Testing Library cover field counts, validation messages, and successful `onSubmit` payloads.

---

## Installation

```bash
npm install react-zod-form-builder react-hook-form @hookform/resolvers zod react react-dom
```

Peer dependencies (install in your app; not bundled by this library):

| Package        | Notes                                      |
| -------------- | ------------------------------------------ |
| `react`        | `>= 18`                                    |
| `react-dom`    | `>= 18`                                    |
| `zod`          | `^3.24` or `^4`                            |

Runtime dependencies (installed automatically unless deduped):

| Package               | Role                          |
| --------------------- | ----------------------------- |
| `react-hook-form`     | Form state                    |
| `@hookform/resolvers` | `zodResolver`                 |

### Styles

Import the compiled stylesheet once (e.g. in your app entry):

```ts
import 'react-zod-form-builder/style.css'
```

---

## Zero-boilerplate usage

```tsx
import { SchemaForm } from 'react-zod-form-builder'
import { z } from 'zod'
import 'react-zod-form-builder/style.css'

const schema = z.object({
  email: z.string().email().describe('you@company.com'),
  age: z.coerce.number().min(18).describe('Must be 18+'),
  role: z.enum(['admin', 'member']).describe('Select access level'),
})

export function SignupCard() {
  return (
    <SchemaForm
      className="max-w-md space-y-4 rounded-2xl border border-neutral-200 p-6"
      schema={schema}
      submitLabel="Continue"
      onSubmit={(values) => {
        // `values` is inferred as z.infer<typeof schema>
        console.log(values)
      }}
    />
  )
}
```

No manual `<input>` list: the schema is the single source of truth.

---

## `.describe()` for hints

- **Strings / numbers / dates** — `.describe('…')` is passed as the input **placeholder** (and guides users without extra props).
- **Enums** — the same string becomes the **disabled first `<select>` option** (a “choose one” prompt).
- **Booleans** — `.describe()` is applied as the native **`title`** tooltip on the checkbox.

Labels are always generated from the object key (e.g. `fullName` → “Full Name”).

---

## Custom components (`components` prop)

Pass partial overrides; everything else keeps the Tailwind defaults.

```tsx
import type { SchemaDateFieldProps } from 'react-zod-form-builder'
import type { FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { DatePicker } from '@/components/DatePicker'

function MyDateField(props: SchemaDateFieldProps<FieldValues>) {
  const { name, control, label, error } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DatePicker label={label} value={field.value} onChange={field.onChange} error={error} />
      )}
    />
  )
}

<SchemaForm
  schema={schema}
  onSubmit={onSubmit}
  components={{
    date: MyDateField,
  }}
/>
```

Export types you will need when overriding:

- `SchemaStringFieldProps`, `SchemaNumberFieldProps`, `SchemaBooleanFieldProps`, `SchemaEnumFieldProps`, `SchemaDateFieldProps`, `SchemaUnsupportedFieldProps`
- `SchemaFormComponents`, `SchemaFormControl`
- `defaultSchemaFormComponents` — spread or wrap defaults if you only replace one kind.

---

## Library build (maintainers)

From this repository:

```bash
npm run build
```

Produces under `dist/`:

| File               | Description                    |
| ------------------ | ------------------------------ |
| `index.mjs`        | ESM bundle                                      |
| `index.js`         | CJS bundle                                      |
| `style.css`        | Tailwind-based default styles                   |
| `index.d.ts`       | TypeScript entry (re-exports nested `.d.ts`)    |

Demo app (Vite SPA) for local development:

```bash
npm run dev
npm run build:demo   # output: dist-demo/
```

---

## License

MIT
