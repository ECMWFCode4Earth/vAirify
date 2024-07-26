import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, useMatches } from 'react-router-dom'

import { Breadcrumbs } from './Breadcrumbs'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatches: jest.fn(),
}))

describe('Breadcrumbs component', () => {
  it('renders a single breadcrumb', () => {
    ;(useMatches as jest.Mock).mockReturnValue([
      {
        handle: {
          breadcrumbs: [{ title: () => 'Viktor Krum' }],
        },
      },
    ])
    render(<Breadcrumbs />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('navigation')).toHaveTextContent('Viktor Krum')
  })

  it('renders multiple breadcrumbs', () => {
    ;(useMatches as jest.Mock).mockReturnValue([
      {
        handle: {
          breadcrumbs: [
            { title: () => 'Players' },
            { path: '/players', title: () => 'Viktor Krum' },
          ],
        },
      },
    ])
    render(<Breadcrumbs />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('navigation')).toHaveTextContent(
      'Players/Viktor Krum',
    )
    expect(screen.getByRole('link')).toHaveTextContent('Viktor Krum')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/players')
  })

  it('renders nothing when there is no breadcrumb config', () => {
    ;(useMatches as jest.Mock).mockReturnValue([
      {
        handle: {},
      },
    ])
    render(<Breadcrumbs />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('navigation')).toHaveTextContent('')
  })
  it('renders nothing when breadcrumb config is invalid', () => {
    ;(useMatches as jest.Mock).mockReturnValue([
      {
        handle: {
          breadcrumbs: [{ path: '/players' }, {}, { title: 'not a function' }],
        },
      },
    ])
    render(<Breadcrumbs />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('navigation')).toHaveTextContent('')
  })
})
