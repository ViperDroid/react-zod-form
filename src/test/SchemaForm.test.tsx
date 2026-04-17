import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { SchemaForm } from '../lib/SchemaForm'

describe('SchemaForm', () => {
  it('renders one control per schema field (string, number, enum)', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
      tier: z.enum(['free', 'pro']),
    })

    const { container } = render(
      <SchemaForm schema={schema} onSubmit={() => undefined} submitLabel="Go" />,
    )

    const controls = container.querySelectorAll('input, select')
    expect(controls).toHaveLength(3)
  })

  it('shows a validation error when a required string is left empty', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      label: z.string().min(1, 'Cannot be empty'),
    })

    render(<SchemaForm schema={schema} onSubmit={() => undefined} submitLabel="Save" />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Cannot be empty')).toBeInTheDocument()
  })

  it('calls onSubmit with parsed values when the form is valid', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      age: z.coerce.number().min(1),
    })
    const onSubmit = vi.fn()

    render(<SchemaForm schema={schema} onSubmit={onSubmit} submitLabel="Send" />)

    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Age'), '42')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Ada',
      age: 42,
    })
  })

  it('prefills fields from defaultValues merged with inferred defaults', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
    })

    render(
      <SchemaForm
        schema={schema}
        defaultValues={{ title: 'Draft title' }}
        onSubmit={() => undefined}
        submitLabel="Save"
      />,
    )

    expect(screen.getByDisplayValue('Draft title')).toBeInTheDocument()
  })

  it('respects fieldOrder for render sequence (labels / tab order)', () => {
    const schema = z.object({
      zebra: z.string().describe('z'),
      apple: z.string().describe('a'),
    })

    const { container } = render(
      <SchemaForm
        schema={schema}
        fieldOrder={['apple', 'zebra']}
        onSubmit={() => undefined}
        submitLabel="Go"
      />,
    )

    const form = container.querySelector('form')!
    const boxes = within(form).getAllByRole('textbox')
    expect(boxes).toHaveLength(2)
    expect(boxes[0]).toHaveAccessibleName(/apple/i)
    expect(boxes[1]).toHaveAccessibleName(/zebra/i)
  })

  it('resets merged values when resetKey changes', async () => {
    const schema = z.object({ name: z.string() })

    const { rerender } = render(
      <SchemaForm
        schema={schema}
        resetKey={1}
        defaultValues={{ name: 'Version one' }}
        onSubmit={() => undefined}
        submitLabel="Save"
      />,
    )

    expect(screen.getByDisplayValue('Version one')).toBeInTheDocument()

    rerender(
      <SchemaForm
        schema={schema}
        resetKey={2}
        defaultValues={{ name: 'Version two' }}
        onSubmit={() => undefined}
        submitLabel="Save"
      />,
    )

    expect(await screen.findByDisplayValue('Version two')).toBeInTheDocument()
  })

  it('renders submitError as an alert', () => {
    const schema = z.object({ x: z.string() })

    const { container } = render(
      <SchemaForm
        schema={schema}
        submitError="That email is already taken."
        onSubmit={() => undefined}
        submitLabel="Send"
      />,
    )

    const form = container.querySelector('form')!
    const alert = within(form).getByRole('alert')
    expect(alert).toHaveTextContent('That email is already taken.')
  })
})
