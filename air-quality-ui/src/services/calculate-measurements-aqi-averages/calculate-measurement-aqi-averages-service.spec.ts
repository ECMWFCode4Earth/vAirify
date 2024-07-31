import { DateTime } from 'luxon'

import {
  SortMeasurementsType,
  averageAqiValues,
  sortMeasurements,
} from './calculate-measurement-aqi-averages-service'
import { MeasurementsResponseDto } from '../types'

describe('sortMeasurements function', () => {
  it(`Categorizes measurement by time into 1 hour buckets`, () => {
    const utc_tz = { zone: 'utc' }

    const measurementsData: MeasurementsResponseDto[] = [
      {
        measurement_date: '2024-07-10T05:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 8.4,
        o3: 8.1,
        pm10: 8.2,
        so2: 5.6,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T04:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 9.1,
        o3: 3.6,
        pm10: 5.5,
        so2: 1.1,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T03:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 9.9,
        o3: 7.1,
        pm10: 3.4,
        so2: 1.1,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T02:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 8.6,
        o3: 1.1,
        pm10: 5.1,
        so2: 1.3,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T01:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 8.6,
        o3: 1.1,
        pm10: 11.1,
        so2: 8.6,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
    ]
    const expected = {
      1: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T01:00:00Z',
            o3: 1.1,
            pm10: 11.1,
            pm2_5: 8.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 8.6,
          },
        ],
        time_str: '2024-07-10T01:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T01:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T00:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T01:30:00.000Z', utc_tz),
      },
      2: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T02:00:00Z',
            o3: 1.1,
            pm10: 5.1,
            pm2_5: 8.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.3,
          },
        ],
        time_str: '2024-07-10T02:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T02:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T01:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T02:30:00.000Z', utc_tz),
      },
      3: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T03:00:00Z',
            o3: 7.1,
            pm10: 3.4,
            pm2_5: 9.9,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.1,
          },
        ],
        time_str: '2024-07-10T03:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T03:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T02:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T03:30:00.000Z', utc_tz),
      },
      4: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T04:00:00Z',
            o3: 3.6,
            pm10: 5.5,
            pm2_5: 9.1,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.1,
          },
        ],
        time_str: '2024-07-10T04:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T04:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T03:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T04:30:00.000Z', utc_tz),
      },
      5: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T05:00:00Z',
            o3: 8.1,
            pm10: 8.2,
            pm2_5: 8.4,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 5.6,
          },
        ],
        time_str: '2024-07-10T05:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T05:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T04:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T05:30:00.000Z', utc_tz),
      },
    }
    const result = sortMeasurements(
      measurementsData,
      DateTime.fromISO('2024-07-10T00:00:00Z', { zone: 'utc' }),
    )
    expect(result).toStrictEqual(expected)
  })
  it(`Still sorts even with missing measurements`, () => {
    const utc_tz = { zone: 'utc' }
    const measurementsData: MeasurementsResponseDto[] = [
      {
        measurement_date: '2024-07-10T05:00:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: { latitude: 10, longitude: 20 },
        api_source: 'OpenAQ',
        pm2_5: 8.4,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
    ]
    const expected = {
      5: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: {
              latitude: 10,
              longitude: 20,
            },
            measurement_date: '2024-07-10T05:00:00Z',
            pm2_5: 8.4,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
          },
        ],
        time_str: '2024-07-10T05:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T05:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T04:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T05:30:00.000Z', utc_tz),
      },
    }
    const result = sortMeasurements(
      measurementsData,
      DateTime.fromISO('2024-07-10T00:00:00Z', utc_tz),
    )
    expect(result).toStrictEqual(expected)
  })
  it(`Includes measurements on lower bound but not upper`, () => {
    const utc_tz = { zone: 'utc' }
    const measurementsData: MeasurementsResponseDto[] = [
      {
        measurement_date: '2024-07-10T04:29:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: {
          latitude: 10,
          longitude: 20,
        },
        api_source: 'OpenAQ',
        pm2_5: 2.9,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
      {
        measurement_date: '2024-07-10T04:30:00Z',
        location_type: 'city',
        location_name: 'São Paulo',
        location: {
          latitude: 10,
          longitude: 20,
        },
        api_source: 'OpenAQ',
        pm2_5: 3.0,
        entity: 'Governmental Organization',
        sensor_type: 'reference grade',
        site_name: 'Sao Paulo',
      },
    ]
    const expected = {
      4: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            measurement_date: '2024-07-10T04:29:00Z',
            pm2_5: 2.9,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
          },
        ],
        time_str: '2024-07-10T04:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T04:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T03:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T04:30:00.000Z', utc_tz),
      },
      5: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            measurement_date: '2024-07-10T04:30:00Z',
            pm2_5: 3.0,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
          },
        ],
        time_str: '2024-07-10T05:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T05:00:00.000Z', utc_tz),
        lowerBound: DateTime.fromISO('2024-07-10T04:30:00.000Z', utc_tz),
        upperBound: DateTime.fromISO('2024-07-10T05:30:00.000Z', utc_tz),
      },
    }
    const result = sortMeasurements(
      measurementsData,
      DateTime.fromISO('2024-07-10T00:00:00Z', utc_tz),
    )
    expect(result).toStrictEqual(expected)
  })
})
describe('averageAqiValues function', () => {
  it(`Average all values within time buckets`, () => {
    const sortedMeasurementData: SortMeasurementsType = {
      0: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T00:00:00.000Z',
            o3: 1.1,
            pm10: 11.1,
            pm2_5: 8.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 8.6,
          },
        ],
        time_str: '2024-07-10T00:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T00:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-09T23:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T00:30:00.000Z'),
      },
      1: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T02:00:00.000Z',
            o3: 1.1,
            pm10: 5.1,
            pm2_5: 8.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.3,
          },
        ],
        time_str: '2024-07-10T01:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T01:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-10T00:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T01:30:00.000Z'),
      },
      2: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location: { latitude: 10, longitude: 20 },
            location_type: 'city',
            measurement_date: '2024-07-10T03:00:00.000Z',
            o3: 7.1,
            pm10: 3.4,
            pm2_5: 9.9,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.1,
          },
        ],
        time_str: '2024-07-10T02:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T02:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-10T01:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T02:30:00.000Z'),
      },
      3: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T04:00:00.000Z',
            o3: 3.6,
            pm10: 5.5,
            pm2_5: 9.1,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 1.1,
          },
        ],
        time_str: '2024-07-10T03:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T03:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-10T02:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T03:30:00.000Z'),
      },
      4: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T05:00:00.000Z',
            o3: 8.1,
            pm10: 8.2,
            pm2_5: 8.4,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
            so2: 5.6,
          },
        ],
        time_str: '2024-07-10T04:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T04:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-10T03:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T04:30:00.000Z'),
      },
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 1 },
      { measurementDate: '2024-07-10T01:00:00.000Z', meanAqiValue: 1 },
      { measurementDate: '2024-07-10T02:00:00.000Z', meanAqiValue: 1 },
      { measurementDate: '2024-07-10T03:00:00.000Z', meanAqiValue: 1 },
      { measurementDate: '2024-07-10T04:00:00.000Z', meanAqiValue: 1 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })
  it(`Only attempt to average time buckets with measurements in them, remove empty time buckets`, () => {
    const sortedMeasurementData: SortMeasurementsType = {
      0: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T00:00:00.000Z',
            pm2_5: 8.6,
            o3: 3.6,
            pm10: 5.5,
            so2: 5.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
          },
        ],
        time_str: '2024-07-10T00:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T00:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-09T23:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T00:30:00.000Z'),
      },
      1: {
        measurements: [],
        time_str: '2024-07-10T01:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T01:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-10T00:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T01:30:00.000Z'),
      },
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 1 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })
  it(`Still averages even with missing measurements`, () => {
    const sortedMeasurementData: SortMeasurementsType = {
      0: {
        measurements: [
          {
            api_source: 'OpenAQ',
            entity: 'Governmental Organization',
            location_name: 'São Paulo',
            location_type: 'city',
            location: { latitude: 10, longitude: 20 },
            measurement_date: '2024-07-10T00:00:00.000Z',
            pm2_5: 8.6,
            sensor_type: 'reference grade',
            site_name: 'Sao Paulo',
          },
        ],
        time_str: '2024-07-10T00:00:00.000Z',
        time: DateTime.fromISO('2024-07-10T00:00:00.000Z'),
        lowerBound: DateTime.fromISO('2024-07-09T23:30:00.000Z'),
        upperBound: DateTime.fromISO('2024-07-10T00:30:00.000Z'),
      },
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 1 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })
})
