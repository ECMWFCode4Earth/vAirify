import {
  DataZoomComponentOption,
  LineSeriesOption,
  TitleComponentOption,
  YAXisComponentOption,
} from 'echarts'

import { generateMeasurementChart } from './site-measurement-chart-builder'
import { PollutantType } from '../../../models'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions()
jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
  ...originalDateResolvedOptions,
  timeZone: 'GMT',
})

describe('Site Measurement Chart', () => {
  const pollutantType: PollutantType = 'pm2_5'
  const zoomPercent: number = 45
  const measurementsBySite: Record<string, MeasurementsResponseDto[]> = {
    locationA: [
      {
        measurement_date: '2024-01-01T01:00:00Z',
        location_name: 'locationA',
        location_type: 'city',
        api_source: 'source',
        entity: 'entity',
        sensor_type: 'type',
        site_name: 'site_name',
        pm2_5: 12,
        pm10: 9,
      },
      {
        measurement_date: '2024-01-01T02:00:00Z',
        location_name: 'locationA',
        location_type: 'city',
        api_source: 'source',
        entity: 'entity',
        sensor_type: 'type',
        site_name: 'site_name',
        pm2_5: 43,
        pm10: 32,
      },
    ],
  }

  const seriesColorsBySite: Record<string, string> = { locationA: 'blue' }

  const forecastBaseData = {
    location_name: 'LocationA',
    no2: {
      aqi_level: 2,
      value: 2,
    },
    o3: {
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

  const forecastData: ForecastResponseDto[] = [
    {
      base_time: '2024-01-01T00:00:00Z',
      valid_time: '2024-01-01T00:00:00Z',
      location_type: 'city',
      overall_aqi_level: 4,
      pm2_5: {
        aqi_level: 2,
        value: 2,
      },
      ...forecastBaseData,
    },
    {
      base_time: '2024-01-02T00:00:00Z',
      valid_time: '2024-01-02T00:00:00Z',
      location_type: 'city',
      overall_aqi_level: 2,
      pm2_5: {
        aqi_level: 4,
        value: 4,
      },
      ...forecastBaseData,
    },
  ]
  describe('title', () => {
    it.each<[PollutantType, string]>([
      ['no2', 'Nitrogen Dioxide'],
      ['so2', 'Sulphur Dioxide'],
      ['o3', 'Ozone'],
      ['pm10', 'PM 10'],
      ['pm2_5', 'PM 2.5'],
    ])(
      `shows the correct pollutant`,
      async (title: PollutantType, expected: string) => {
        const result = generateMeasurementChart(
          title,
          zoomPercent,
          measurementsBySite,
          forecastData,
        )
        expect((result.title as TitleComponentOption).text).toBe(expected)
      },
    )
  })

  describe('yAxis', () => {
    it('label is AQI', async () => {
      const result = generateMeasurementChart(
        pollutantType,
        zoomPercent,
        measurementsBySite,
        forecastData,
      )
      expect((result.yAxis as YAXisComponentOption).name).toBe('µg/m³')
    })

    it('label is in middle of axis', async () => {
      const result = generateMeasurementChart(
        pollutantType,
        zoomPercent,
        measurementsBySite,
        forecastData,
      )
      expect((result.yAxis as YAXisComponentOption).nameLocation).toBe('middle')
    })

    it('type is value', async () => {
      const result = generateMeasurementChart(
        pollutantType,
        zoomPercent,
        measurementsBySite,
        forecastData,
      )
      expect((result.yAxis as YAXisComponentOption).type).toBe('value')
    })
  })

  describe('zoom', () => {
    it('zoom bar is zoomed', async () => {
      const result = generateMeasurementChart(
        pollutantType,
        zoomPercent,
        measurementsBySite,
        forecastData,
      )
      expect((result.dataZoom as DataZoomComponentOption).end).toBe(zoomPercent)
    })
  })

  describe('series', () => {
    describe('forecast', () => {
      it('should be a line chart', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(result.series.find((x) => x.name === 'Forecast')?.type).toBe(
          'line',
        )
      })

      it('line should be black', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(result.series.find((x) => x.name === 'Forecast')?.color).toBe(
          'black',
        )
      })

      it('line should be dashed', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(
          (result.series.find((x) => x.name === 'Forecast') as LineSeriesOption)
            .lineStyle?.type,
        ).toBe('dashed')
      })

      it('to map measurement data correctly', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        const data = (
          result.series.find((x) => x.name === 'Forecast') as LineSeriesOption
        ).data
        expect(data).toHaveLength(2)
        expect(data).toEqual([
          ['2024-01-01T00:00:00.000Z', '2.0'],
          ['2024-01-02T00:00:00.000Z', '4.0'],
        ])
      })
    })

    describe('measurement', () => {
      it('should be a line chart', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(result.series.find((x) => x.name === 'locationA')?.type).toBe(
          'line',
        )
      })

      it('line should be blue', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(result.series.find((x) => x.name === 'locationA')?.color).toBe(
          'blue',
        )
      })

      it('line should be dashed', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        expect(
          (
            result.series.find(
              (x) => x.name === 'locationA',
            ) as LineSeriesOption
          ).lineStyle?.type,
        ).toBe('solid')
      })

      it('to map measurement data correctly', async () => {
        const result = generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )
        const data = (
          result.series.find((x) => x.name === 'locationA') as LineSeriesOption
        ).data
        expect(data).toHaveLength(2)
        expect(data).toEqual([
          ['2024-01-01T01:00:00.000Z', '12.0'],
          ['2024-01-01T02:00:00.000Z', '43.0'],
        ])
      })
    })
  })
})
