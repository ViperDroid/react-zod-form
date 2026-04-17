import { render, screen, waitFor } from '@testing-library/react'
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
})
