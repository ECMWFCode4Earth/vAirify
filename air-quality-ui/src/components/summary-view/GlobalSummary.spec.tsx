import '@testing-library/jest-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import GlobalSummary from './GlobalSummary'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ data: {}, isError: false }),
  useQueries: jest.fn().mockReturnValue({ data: {}, isError: false }),
}))

jest.mock('../../services/forecast-time-service', () => ({
  getLatestBaseForecastTime: jest
    .fn()
    .mockImplementation(() =>
      DateTime.fromISO('2024-06-02T03:00:00', { zone: 'UTC' }),
    ),
  getValidForecastTimesBetween: jest
    .fn()
    .mockImplementation(() => [
      DateTime.fromISO('2024-06-01T03:00:00', { zone: 'UTC' }),
      DateTime.fromISO('2024-06-01T15:00:00', { zone: 'UTC' }),
    ]),
}))

describe('GlobalSummary component', () => {
  it('shows message when loading forecast data errors', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isError: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
  it('shows message when loading summary data errors', async () => {
    ;(useQueries as jest.Mock).mockReturnValueOnce({
      data: null,
      isError: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
  // it('shows forecast base time', async () => {
  //   render(<GlobalSummary />)
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText('Forecast Base Time: 01 Jun 03:00 UTC'),
  //     ).toBeInTheDocument()
  //   })
  // })
  // it('shows forecast valid time range', async () => {
  //   render(<GlobalSummary />)
  //   await waitFor(() => {
  //     expect(screen.getByTestId('forecast-valid-range')).toHaveTextContent(
  //       'Forecast Valid Time Range: 01 Jun 03:00 - 01 Jun 15:00 UTC',
  //     )
  //   })
  // })
  // it('shows the summary table', async () => {
  //   render(<GlobalSummary />)
  //   await waitFor(() => {
  //     expect(screen.getByTestId('summary-grid')).toBeInTheDocument()
  //   })
  // })

  it('When switch is clicked change to highlight primary AQI values mode', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      data: {
        Dubai: [
          {
            base_time: '2024-06-02T03:00:00Z',
            valid_time: '2024-06-02T03:00:00Z',
            location_type: 'city',
            location_name: 'Dubai',
            overall_aqi_level: 6.0,
            no2: { aqi_level: 1, value: 13.584082735635388 },
            so2: { aqi_level: 1, value: 13.584082735635388 },
            pm2_5: { aqi_level: 1, value: 13.584082735635388 },
            pm10: { aqi_level: 1, value: 13.584082735635388 },
            o3: { aqi_level: 1, value: 13.584082735635388 },
          },
          {
            base_time: '2024-06-01T03:00:00Z',
            valid_time: '2024-06-01T06:00:00Z',
            location_type: 'city',
            location_name: 'Dubai',
            overall_aqi_level: 6.0,
            no2: { aqi_level: 1, value: 13.584082735635388 },
            so2: { aqi_level: 1, value: 13.584082735635388 },
            pm2_5: { aqi_level: 1, value: 13.584082735635388 },
            pm10: { aqi_level: 1, value: 13.584082735635388 },
            o3: { aqi_level: 1, value: 13.584082735635388 },
          },
        ],
      },
      isError: false,
    })
    ;(useQueries as jest.Mock).mockReturnValueOnce({
      data: {
        Dubai: [
          {
            measurement_base_time: '2024-06-01T03:00:00Z',
            location_type: 'city',
            location_name: 'Dubai',
            overall_aqi_level: { mean: 6.0 },
            no2: { mean: { aqi_level: 1, value: 13.584082735635388 } },
          },
          {
            measurement_base_time: '2024-06-01T06:00:00Z',
            location_type: 'city',
            location_name: 'Dubai',
            overall_aqi_level: { mean: 6.0 },
            so2: { mean: { aqi_level: 1, value: 24.650014087573723 } },
          },
        ],
      },
      isError: false,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('24.650014087573723')).toHaveClass('ddd')
    })
  })
})
