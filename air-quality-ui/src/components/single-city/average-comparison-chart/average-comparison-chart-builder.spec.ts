import {
  DataZoomComponentOption,
  LineSeriesOption,
  TitleComponentOption,
  YAXisComponentOption,
} from 'echarts'

import { getForecastOptions } from './average-comparison-chart-builder'
import { AverageAqiValues } from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import { ForecastResponseDto } from '../../../services/types'

const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions()
jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
  ...originalDateResolvedOptions,
  timeZone: 'GMT',
})

describe('AverageComparisonChart', () => {
  const forecastBaseData = {
    location_name: 'string',
    location: { longitude: 10, latitude: 20 },
    no2: {
      aqi_level: 2,
      value: 2,
    },
    o3: {
      aqi_level: 2,
      value: 2,
    },
    pm2_5: {
      aqi_level: 2,
      value: 2,
    },
    pm10: {
      aqi_level: 2,
      value: 2,
    },
    so2: {
      aqi_level: 2,
      value: 2,
    },
  }

  const testForecastData: ForecastResponseDto[] = [
    {
      base_time: '2024-01-01T00:00:00Z',
      valid_time: '2024-01-01T00:00:00Z',
      location_type: 'city',
      overall_aqi_level: 4,
      ...forecastBaseData,
    },
    {
      base_time: '2024-01-02T00:00:00Z',
      valid_time: '2024-01-02T00:00:00Z',
      location_type: 'city',
      overall_aqi_level: 2,
      ...forecastBaseData,
    },
  ]

  const testMeasurementData: AverageAqiValues[] = [
    {
      meanAqiValue: 3,
      measurementDate: '2024-01-01T00:00:00Z',
    },
    {
      meanAqiValue: 4,
      measurementDate: '2024-01-02T00:00:00Z',
    },
  ]

  const zoomPercent = 37

  describe('title', () => {
    it('says AQI', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )
      expect((result.title as TitleComponentOption).text).toBe(
        'city-name - AQI',
      )
    })

    it('is in the center', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )
      expect((result.title as TitleComponentOption).left).toBe('center')
    })
  })

  describe('yAxis', () => {
    it('label is AQI', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )
      expect((result.yAxis as YAXisComponentOption).name).toBe('AQI')
    })

    it('label is in middle of axis', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )
      expect((result.yAxis as YAXisComponentOption).nameLocation).toBe('middle')
    })

    it('type is value', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )
      expect((result.yAxis as YAXisComponentOption).type).toBe('value')
    })
  })

  describe('zoom', () => {
    it('is visible', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )

      expect(result.dataZoom as DataZoomComponentOption).toBeDefined()
    })

    it('zoom bar is zoomed', async () => {
      const result = getForecastOptions(
        'city-name',
        zoomPercent,
        testForecastData,
        testMeasurementData,
      )

      expect((result.dataZoom as DataZoomComponentOption).end).toBe(zoomPercent)
    })
  })

  describe('series', () => {
    describe('Forecast data', () => {
      it('type is line', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(result.series.find((x) => x.name === 'Forecast')?.type).toBe(
          'line',
        )
      })

      it('has the correct number of data points', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(
          result.series.find((x) => x.name === 'Forecast')?.data,
        ).toHaveLength(2)
      })

      it('has mapped the forecast data correctly', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(result.series.find((x) => x.name === 'Forecast')?.data).toEqual([
          ['2024-01-01T00:00:00.000Z', 4],
          ['2024-01-02T00:00:00.000Z', 2],
        ])
      })
    })

    describe('Measurement data', () => {
      it('type is line', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(result.series.find((x) => x.name === 'Measurement')?.type).toBe(
          'line',
        )
      })

      it('line has correct width', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(
          (
            result.series.find(
              (x) => x.name === 'Measurement',
            ) as LineSeriesOption
          ).lineStyle?.width,
        ).toBe(5)
      })

      it('has the correct number of datapoints', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(
          result.series.find((x) => x.name === 'Measurement')?.data,
        ).toHaveLength(2)
      })

      it('to map measurement data correctly', async () => {
        const result = getForecastOptions(
          'city-name',
          zoomPercent,
          testForecastData,
          testMeasurementData,
        )
        expect(
          result.series.find((x) => x.name === 'Measurement')?.data,
        ).toEqual([
          ['2024-01-01T00:00:00.000Z', 3],
          ['2024-01-02T00:00:00.000Z', 4],
        ])
      })
    })
  })
})
