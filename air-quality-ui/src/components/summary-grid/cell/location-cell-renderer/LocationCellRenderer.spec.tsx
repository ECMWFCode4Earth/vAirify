import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

import { LocationCellRenderer } from './LocationCellRenderer'

describe('LocationCellRenderer component', () => {
  const city = 'Bristol'
  const eGridCell = document.createElement('div')

  const renderComponent = () => {
    const user = userEvent.setup()
    render(<LocationCellRenderer value={city} eGridCell={eGridCell} />, {
      wrapper: BrowserRouter,
    })
    return { user }
  }

  it('renders the location', () => {
    renderComponent()
    expect(screen.getByRole('link')).toHaveTextContent(city)
  })

  it('Navigates to single city page on click', async () => {
    const { user } = renderComponent()
    await user.click(screen.getByRole('link'))
    expect(document.location.pathname).toBe(`/city/${city}`)
  })

  it('Navigates to single city page on typing Enter', async () => {
    const { user } = renderComponent()
    await user.type(eGridCell, '[Enter]')
    expect(document.location.pathname).toBe(`/city/${city}`)
  })
})
