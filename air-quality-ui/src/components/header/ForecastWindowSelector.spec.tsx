import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

import { ForecastWindowSelector } from './ForecastWindowSelector'

describe('ForecastWindowSelector component', () => {
  it('Select box label is present', async () => {
    render(
      <ForecastWindowSelector
        setSelectedForecastWindowState={() => {}}
        selectedForecastWindow={{ value: 1, label: '1' }}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Forecast Window')).toBeInTheDocument()
    })
  })
  it('Select box is present', async () => {
    render(
      <ForecastWindowSelector
        setSelectedForecastWindowState={() => {}}
        selectedForecastWindow={{ value: 1, label: '1' }}
      />,
    )
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
