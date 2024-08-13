import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'

import { ForecastBaseDatePickerProps } from './ForecastBaseDatePicker'
import {
  ForecastWindowOption,
  ForecastWindowSelectorProps,
} from './ForecastWindowSelector'
import { Toolbar } from './Toolbar'

const mockSetForecastBaseDate: (val: DateTime) => void = jest.fn()
const mockSetMaxForecastDate: (val: number) => void = jest.fn()
const mockSetMaxInSituDate: (val: number) => void = jest.fn()

const dateNow = DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' })
Settings.now = () => dateNow.toMillis()

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' }),
    maxInSituDate: DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
    setForecastBaseDate: (x: DateTime) => mockSetForecastBaseDate(x),
    setMaxForecastDate: (x: number) => mockSetMaxForecastDate(x),
    setMaxInSituDate: (x: number) => mockSetMaxInSituDate(x),
  }),
}))

jest.mock('./Breadcrumbs', () => ({ Breadcrumbs: () => 'mocked breadcrumbs' }))

const mockForecastBaseDatePicker = jest
  .fn()
  .mockReturnValue(<span>mock ForecastBaseDatePicker</span>)

let setIsInvalidDateTime: (val: boolean) => void
let setSelectedForecastBaseDate: (val: DateTime<boolean>) => void

jest.mock('./ForecastBaseDatePicker', () => ({
  ForecastBaseDatePicker: (props: ForecastBaseDatePickerProps) => {
    setIsInvalidDateTime = props.setIsInvalidDateTime
    setSelectedForecastBaseDate = props.setSelectedForecastBaseDate
    return mockForecastBaseDatePicker(props)
  },
}))

const mockForecastWindowSelector = jest
  .fn()
  .mockReturnValue(<span>mock ForecastBaseDatePicker</span>)

let setSelectedForecastWindow: (val: ForecastWindowOption) => void
let selectedForecastWindow: ForecastWindowOption
jest.mock('./ForecastWindowSelector', () => ({
  ForecastWindowSelector: (props: ForecastWindowSelectorProps) => {
    setSelectedForecastWindow = props.setSelectedForecastWindowState
    selectedForecastWindow = props.selectedForecastWindow
    return mockForecastWindowSelector(props)
  },
}))

describe('Toolbar component', () => {
  it('renders toolbar', () => {
    render(<Toolbar />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })
  it('Invalid date stops button from being used', async () => {
    render(<Toolbar />)
    setIsInvalidDateTime(true)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })
  it('Valid date allows button to be used', async () => {
    render(<Toolbar />)
    setIsInvalidDateTime(false)
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
    })
  })
  it('Setting valid date and clicking button updates context', async () => {
    render(<Toolbar />)
    await waitFor(() => {
      setSelectedForecastBaseDate(
        DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
      )
    })
    fireEvent.click(screen.getByText('Ok'))
    await waitFor(() => {
      expect(mockSetForecastBaseDate).toHaveBeenCalledWith(
        DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
      )
    })
  })
  it('Setting invalid date and clicking button does not update context', async () => {
    render(<Toolbar />)
    await waitFor(() => {
      setSelectedForecastBaseDate(
        DateTime.fromISO('2024-08-10T09:00:00', { zone: 'utc' }),
      )
    })
    await waitFor(() => {
      setIsInvalidDateTime(true)
    })
    fireEvent.click(screen.getByText('Ok'))
    await waitFor(() => {
      expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(
        DateTime.fromISO('2024-08-10T09:00:00', { zone: 'utc' }),
      )
    })
  })
  ;[
    {
      testData: { value: 1, label: '1' },
      expected: 1,
    },
    {
      testData: { value: 2, label: '2' },
      expected: 2,
    },
    {
      testData: { value: 3, label: '3' },
      expected: 3,
    },

    {
      testData: { value: 4, label: '4' },
      expected: 4,
    },
    {
      testData: { value: 5, label: '5' },
      expected: 5,
    },
  ].forEach(({ testData, expected }) => {
    it(`When forecast window selector is changed to ${testData}, when the ok button is clicked, selectedForecastWindow is ${expected}`, async () => {
      render(<Toolbar />)
      const beforeSetting = selectedForecastWindow
      await waitFor(() => {
        setSelectedForecastWindow(testData)
      })
      fireEvent.click(screen.getByText('Ok'))
      await waitFor(() => {
        expect(beforeSetting).toStrictEqual({ value: 1, label: '1' })
      })
      await waitFor(() => {
        expect(mockSetMaxForecastDate).toHaveBeenCalledWith(expected)
      })
    })
  })
})
