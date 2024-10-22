import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

import { LocationCellRenderer } from './LocationCellRenderer'

const mockAddEventListener = jest.fn()

describe('LocationCellRenderer component', () => {
  const eGridCell: Partial<HTMLElement> = {
    addEventListener: mockAddEventListener,
    setAttribute: () => {},
    removeEventListener: () => {},
  }

  const renderComponent = (city: string) =>
    render(
      <LocationCellRenderer
        value={city}
        eGridCell={eGridCell as HTMLElement}
      />,
      {
        wrapper: BrowserRouter,
      },
    )

  afterEach(() => {
    mockAddEventListener.mockClear()
  })

  it('renders the location', () => {
    const city = 'London'
    renderComponent(city)
    expect(screen.getByRole('link')).toHaveTextContent(city)
  })

  it('Navigates to single city page on click', async () => {
    const city = 'Paris'
    const user = userEvent.setup()
    renderComponent(city)
    await user.click(screen.getByRole('link'))
    expect(window.location.pathname).toBe(`/city/${city}`)
  })

  it('Binds keyboard event handler to eGridCell', async () => {
    // Cannot test actual interaction because eGridCell is not added to the DOM
    // by LocationCellRenderer, so all we can do is test calls
    const city = 'Bristol'
    renderComponent(city)

    expect(mockAddEventListener).toHaveBeenCalledTimes(1)
    const [eventName, eventCallback] = mockAddEventListener.mock
      .calls[0] as Parameters<HTMLElement['addEventListener']>
    expect(eventName).toEqual('keydown')

    act(() => {
      ;(eventCallback as EventListener)({ code: 'Enter' } as KeyboardEvent)
    })
    expect(window.location.pathname).toBe(`/city/${city}`)
  })
})
