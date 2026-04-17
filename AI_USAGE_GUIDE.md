# AI usage guide — `@viper_droid/react-zod-form-builder`

This document is for **AI coding agents** (Cursor, Copilot, ChatGPT, etc.) and humans who drive them. It tells you exactly how to generate and extend forms with this library **without inventing APIs**.

---

## Mental model

1. **One Zod object** (`z.object({ ... })`) is the source of truth for fields, types, and validation.
2. **`SchemaForm`** wires that schema to **React Hook Form** + **`zodResolver`**.
3. **Defaults** come from built-in renderers (Tailwind). **Overrides** go through the `components` prop (per Zod *kind*: `string`, `number`, `boolean`, `enum`, `date`, `unsupported`).
4. **`.describe()`** carries human hints *and* optional machine tokens (see below).

---

## Describe-string conventions (metadata)

Parsed from the **raw** `.describe()` text on a field (or its unwrapped leaf). Tokens can appear anywhere; separate free text with `|` or commas.

| Token     | Example in `.describe()`        | Effect |
| --------- | -------------------------------- | ------ |
| `step:N`  | `Work email \| step:2`          | With `SchemaForm` **`currentStep={N}`**, only matching fields render. Fields **without** `step:` appear on **every** step. |
| `cols:N`  | `First name \| cols:1 step:1`   | When **any** field declares `cols:`, the field area uses a **2-column CSS grid**; `cols:2` → Tailwind `col-span-2`, etc. (1–12). |
| (rest)    | After stripping `step:`/`cols:` | Used as **placeholder** / select hint / checkbox `title`. |

**Strip behavior:** UI placeholders use the describe string **after** removing `step:` and `cols:` fragments so users do not see raw tokens.

---

## Conditional visibility

| Mechanism | When to use |
| --------- | ------------ |
| **`components.visibleIf`** | Declarative map: `fieldName → (formValues) => boolean`. Runs on **watched** values. |
| **Custom component + `formValues` prop** | Return `null` for imperative / complex branches. |
| **`hiddenFields`** | Static list of keys to never render. |

Order of evaluation: `hiddenFields` → **`currentStep`** filter → **`components.visibleIf`** → render.

> **Note:** Hiding a field does **not** unregister it from React Hook Form by default. Pair visibility with **optional Zod fields** or custom validation if hidden fields must not block submit.

---

## Multi-step UX (recommended pattern)

1. Hold `step` in React state (`1`, `2`, …).
2. Pass **`currentStep={step}`** so only fields for that step render.
3. Use **`showSubmitButton={step === last}`** and add a **`type="button"`** “Next” control in **`children`** for non-final steps.
4. Keep fields for *other* steps **optional** in Zod unless you implement partial `trigger()` / separate schemas.

---

## Loading & success

- **`isLoading`**: disables submit, sets `aria-busy`, swaps button label to **`loadingLabel`**.
- **`isSuccess`**: shows **`successMessage`**, soft-disables interaction on the field block, and disables submit until the parent clears the flag.

Parent is responsible for toggling these flags around `async` `onSubmit`.

---

## Imports consumers need

```tsx
import { SchemaForm } from '@viper_droid/react-zod-form-builder'
import { z } from 'zod'
import '@viper_droid/react-zod-form-builder/style.css'
```

Optional types / helpers:

```tsx
import type {
  SchemaFormComponentOverrides,
  SchemaNumberFieldProps,
} from '@viper_droid/react-zod-form-builder'
import { defaultSchemaFormComponents, splitSchemaFormComponentOverrides } from '@viper_droid/react-zod-form-builder'
```

---

## Golden prompt (copy for end users)

Copy everything inside the block into Cursor / your agent chat:

```text
Use the npm library `@viper_droid/react-zod-form-builder` with Zod 3/4 and React Hook Form.

Requirements:
1. Import `SchemaForm` from `@viper_droid/react-zod-form-builder` and `import '@viper_droid/react-zod-form-builder/style.css'`.
2. Define a single `z.object({ ... })` schema. Use `.describe()` for user-facing hints.
3. For a wizard, encode steps in describe using `step:1`, `step:2`, etc., and pass `currentStep={...}` to `SchemaForm`. Fields without `step:` show on every step.
4. For a two-column grid row, add `cols:1` or `cols:2` in describe for fields; the library applies Tailwind `col-span-*` when any field uses `cols:`.
5. For conditional fields, either pass `components={{ ..., visibleIf: { fieldName: (v) => boolean } }}` or a custom renderer that reads `props.formValues` and returns `null`.
6. Use `isLoading` / `isSuccess` / `successMessage` / `loadingLabel` for async UX.
7. Type `onSubmit` as the handler for `z.infer<typeof schema>` (output type).

Generate the schema and a working React component with no hand-written field markup except optional `children` buttons.
```

---

## Anti-patterns (do not generate these)

- Do **not** wrap `SchemaForm` in another `<form>` (nested forms).
- Do **not** assume hidden fields unregister automatically.
- Do **not** invent props not listed on `SchemaFormProps` / this guide.
- Do **not** put `step:` / `cols:` only in comments — they must be inside **`.describe('...')`** strings to be picked up.

---

## File map (for agents exploring the repo)

| Path | Role |
| ---- | ---- |
| `src/lib/SchemaForm.tsx` | Main component + prop TSDoc |
| `src/lib/schemaIntrospection.ts` | `step` / `cols` parsing, unwrap helpers |
| `src/lib/schemaFormFields.ts` | Field prop types, `SchemaFormComponentOverrides`, `splitSchemaFormComponentOverrides` |
| `src/lib/defaultSchemaFormComponents.tsx` | Default Tailwind field renderers |
| `src/App.tsx` | Kitchen-sink demo (steps, `visibleIf`, grid, loading) |

---

## Versioning note

This library targets **Zod 3.24+ / 4.x** and **React 18+**. If the agent picks an incompatible stack, surface the mismatch to the user.
