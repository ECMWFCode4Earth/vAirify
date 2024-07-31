import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'

import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'

describe('ForecastBaseDatePicker component', () => {
  it('Displays date picker', async () => {
    render(
      <ForecastBaseDatePicker
        setSelectedForecastBaseDate={() => {}}
        forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
          zone: 'utc',
        })}
        isTimeInvalid={() => {
          return true
        }}
      />,
    )
    expect(screen.getByLabelText('Forecast Base Date')).toBeInTheDocument()
  })
})
