import { useCallback, useState } from 'react'
import { z } from 'zod'
import { SchemaForm } from './lib'

const kitchenSinkSchema = z.object({
  firstName: z.string().min(1, 'First name is required').describe('cols:1 step:1 | Legal first name'),
  lastName: z.string().min(1, 'Last name is required').describe('cols:1 step:1 | Family name'),
  showBonus: z.boolean().describe('step:1 | Show optional promo field'),
  bonusCode: z.string().optional().describe('step:1 | Promo or referral code'),
  /** Kept optional + loose string so step 1 never blocks on an empty default while the field is hidden. */
  email: z.string().optional().describe('step:2 | Work email alias'),
  plan: z.enum(['starter', 'pro']).optional().describe('step:2 | Billing plan'),
})

type KitchenOutput = z.infer<typeof kitchenSinkSchema>

export default function App() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [payload, setPayload] = useState<KitchenOutput | null>(null)
  const [formKey, setFormKey] = useState(0)

  const onSubmit = useCallback(
    async (data: KitchenOutput) => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 700))
      setLoading(false)
      setPayload(data)
      setSuccess(true)
    },
    [],
  )

  const resetDemo = () => {
    setStep(1)
    setSuccess(false)
    setPayload(null)
    setLoading(false)
    setFormKey((k) => k + 1)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-left sm:px-6">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          Kitchen sink demo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          @viper_droid/react-zod-form-builder
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          This screen exercises <strong className="text-neutral-800 dark:text-neutral-200">multi-step</strong>{' '}
          (<code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">step:N</code> in{' '}
          <code className="font-mono text-xs">.describe()</code>), a{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">2-column grid</strong> for first/last name (
          <code className="font-mono text-xs">cols:1</code>),{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">conditional</strong> promo text via{' '}
          <code className="font-mono text-xs">components.visibleIf</code>, and{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">loading / success</strong> states on the final
          submit. See <code className="font-mono text-xs">AI_USAGE_GUIDE.md</code> for agent-oriented instructions.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium dark:bg-neutral-800">
            Step {step} of 2
          </span>
          <button
            type="button"
            onClick={resetDemo}
            className="rounded-full border border-neutral-300 px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800/80"
          >
            Reset demo
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <SchemaForm
          key={formKey}
          className="max-w-xl"
          schema={kitchenSinkSchema}
          currentStep={step}
          showSubmitButton={step === 2}
          isLoading={loading}
          isSuccess={success}
          successMessage="All set — your profile was saved (demo)."
          loadingLabel="Saving…"
          submitLabel="Finish & save"
          components={{
            visibleIf: {
              bonusCode: (v) => v.showBonus === true,
            },
          }}
          onSubmit={onSubmit}
        >
          {step === 1 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setStep(2)}
              >
                Continue to step 2
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={() => setStep(1)}
            >
              ← Back to step 1
            </button>
          )}
        </SchemaForm>
      </section>

      {payload && success ? (
        <section
          className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
          aria-live="polite"
        >
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Parsed payload</h2>
          <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100 dark:bg-black">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  )
}
