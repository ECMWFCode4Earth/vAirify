import { DateTime } from 'luxon'

import {
  SortMeasurementsType,
  averageAqiValues,
  sortMeasurements,
} from './calculate-measurement-aqi-averages-service'
import { MeasurementsResponseDto } from '../types'

describe('sortMeasurements function', () => {
  it(`Categorizes measurement by time into 1 hour buckets`, () => {
    const expected = {
      '2024-07-10T02:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T01:00:00Z',
          pm2_5: 8.6,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T03:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T02:00:00Z',
          pm2_5: 9.9,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T04:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T03:00:00Z',
          pm2_5: 11.3,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T05:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T04:00:00Z',
          pm2_5: 8.4,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T06:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T05:00:00Z',
          pm2_5: 7.5,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
    }
    const measurementsData: MeasurementsResponseDto[] = [
      {
        measurement_date: '2024-07-10T05:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        api_source: 'OpenAQ',
        pm2_5: 7.5,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T04:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        api_source: 'OpenAQ',
        pm2_5: 8.4,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T03:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        api_source: 'OpenAQ',
        pm2_5: 11.3,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T02:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        api_source: 'OpenAQ',
        pm2_5: 9.9,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T01:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        api_source: 'OpenAQ',
        pm2_5: 8.6,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
    ]
    const result = sortMeasurements(
      measurementsData,
      DateTime.fromISO('2024-07-10T00:00:00Z'),
    )
    expect(result).toStrictEqual(expected)
  })
})
describe('averageAqiValues function', () => {
  it(`Average all values within time buckets`, () => {
    const input: SortMeasurementsType = {
      '2024-07-10T02:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T01:00:00Z',
          pm2_5: 8.6,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T03:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T02:00:00Z',
          pm2_5: 9.9,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T04:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T03:00:00Z',
          pm2_5: 11.3,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T05:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T04:00:00Z',
          pm2_5: 8.4,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T06:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T05:00:00Z',
          pm2_5: 7.5,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
    }
    const expected = [
      ['2024-07-10T02:00:00.000+01:00', 1],
      ['2024-07-10T03:00:00.000+01:00', 1],
      ['2024-07-10T04:00:00.000+01:00', 2],
      ['2024-07-10T05:00:00.000+01:00', 1],
      ['2024-07-10T06:00:00.000+01:00', 1],
    ]
    const result = averageAqiValues(input)
    expect(result).toStrictEqual(expected)
  })
  it(`Only attempt to average time buckets with measurements in them, remove empty time buckets`, () => {
    const input: SortMeasurementsType = {
      '2024-07-10T02:00:00.000+01:00': [
        {
          api_source: 'OpenAQ',
          entity: 'Governmental Organization',
          location_name: 'São Paulo',
          location_type: 'city',
          measurement_date: '2024-07-10T01:00:00Z',
          pm2_5: 8.6,
          sensor_type: 'reference grade',
          site_name: 'Sao Paulo',
        },
      ],
      '2024-07-10T03:00:00.000+01:00': [],
    }
    const expected = [['2024-07-10T02:00:00.000+01:00', 1]]
    const result = averageAqiValues(input)
    expect(result).toStrictEqual(expected)
  })
})
