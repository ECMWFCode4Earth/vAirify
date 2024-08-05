import each from 'jest-each'
import { DateTime } from 'luxon'

import {
  SortMeasurementsType,
  averageAqiValues,
  sortMeasurements,
} from './calculate-measurement-aqi-averages-service'
import { PollutantType } from '../../models'
import * as CalcService from '../aqi-calculator/aqi-calculator-service'
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
            location: {
              latitude: 10,
              longitude: 20,
            },
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
            location: {
              latitude: 10,
              longitude: 20,
            },
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

const mock_getPollutantIndexLevel = jest.fn()

describe('averageAqiValues function', () => {
  beforeAll(() => {
    jest
      .spyOn(CalcService, 'getPollutantIndexLevel')
      .mockImplementation(mock_getPollutantIndexLevel)
  })

  it(`Returns AQI of 0 without getting pollutant index for single measurement without pollutants`, () => {
    const measurement = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
    const sortedMeasurementData: SortMeasurementsType = {
      0: mock_time_bucket('2024-07-10T00:00:00.000Z', [measurement]),
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 0 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
    expect(mock_getPollutantIndexLevel).not.toHaveBeenCalled()
  })

  it(`Returns relevant AQI for single measurement with one pollutant`, () => {
    const measurement = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
    measurement['pm2_5'] = 11
    mock_getPollutantIndexLevel.mockReturnValueOnce(3)

    const sortedMeasurementData: SortMeasurementsType = {
      0: mock_time_bucket('2024-07-10T00:00:00.000Z', [measurement]),
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 3 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })

  it(`Returns highest AQI for single measurement with all pollutants`, () => {
    const measurement = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
    measurement['pm2_5'] = 11
    measurement['pm10'] = 22
    measurement['no2'] = 33
    measurement['o3'] = 44
    measurement['so2'] = 55

    mock_getPollutantIndexLevel
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)

    const sortedMeasurementData: SortMeasurementsType = {
      0: mock_time_bucket('2024-07-10T00:00:00.000Z', [measurement]),
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 5 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })

  it(`Calls the right aqi converters for single measurement with all pollutants`, () => {
    const measurement = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
    measurement['pm2_5'] = 25
    measurement['pm10'] = 10
    measurement['no2'] = 92
    measurement['o3'] = 3
    measurement['so2'] = 62

    const sortedMeasurementData: SortMeasurementsType = {
      0: mock_time_bucket('2024-07-10T00:00:00.000Z', [measurement]),
    }
    averageAqiValues(sortedMeasurementData)
    expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(25, 'pm2_5')
    expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(10, 'pm10')
    expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(92, 'no2')
    expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(3, 'o3')
    expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(62, 'so2')
  })

  each([['pm2_5'], ['pm10'], ['no2'], ['so2'], ['o3']]).it(
    `Returns AQI of the average measurement (mean) when multiple measurements in bucket for pollutant '%s'`,
    (pollutant) => {
      const pollutantKey = pollutant as PollutantType
      const measurement_1 = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
      measurement_1[pollutantKey] = 25
      const measurement_2 = mock_sorted_measurement('2024-07-10T00:00:05.000Z')
      measurement_2[pollutantKey] = 35
      const measurement_3 = mock_sorted_measurement('2024-07-10T00:00:10.000Z')
      measurement_3[pollutantKey] = 90

      mock_getPollutantIndexLevel.mockReturnValueOnce(3)

      const sortedMeasurementData: SortMeasurementsType = {
        0: mock_time_bucket('2024-07-10T00:00:00.000Z', [
          measurement_1,
          measurement_2,
          measurement_3,
        ]),
      }
      const expected = [
        { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 3 },
      ]
      const result = averageAqiValues(sortedMeasurementData)
      expect(result).toStrictEqual(expected)
      expect(mock_getPollutantIndexLevel).toHaveBeenCalledWith(50, pollutant)
    },
  )

  it(`Returns multiple AQI values when multiple buckets`, () => {
    const measurement_1 = mock_sorted_measurement('2024-07-10T00:00:00.000Z')
    measurement_1['pm2_5'] = 25
    const measurement_2 = mock_sorted_measurement('2024-07-10T01:00:00.000Z')
    measurement_2['pm2_5'] = 35
    const measurement_3 = mock_sorted_measurement('2024-07-10T02:00:00.000Z')
    measurement_3['pm2_5'] = 90

    mock_getPollutantIndexLevel
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(5)

    const sortedMeasurementData: SortMeasurementsType = {
      0: mock_time_bucket('2024-07-10T00:00:00.000Z', [measurement_1]),
      1: mock_time_bucket('2024-07-10T01:00:00.000Z', [measurement_2]),
      2: mock_time_bucket('2024-07-10T02:00:00.000Z', [measurement_3]),
    }
    const expected = [
      { measurementDate: '2024-07-10T00:00:00.000Z', meanAqiValue: 3 },
      { measurementDate: '2024-07-10T01:00:00.000Z', meanAqiValue: 4 },
      { measurementDate: '2024-07-10T02:00:00.000Z', meanAqiValue: 5 },
    ]
    const result = averageAqiValues(sortedMeasurementData)
    expect(result).toStrictEqual(expected)
  })
})

const mock_time_bucket = (
  midpoint_datetime: string,
  measurements: MeasurementsResponseDto[],
) => {
  return {
    measurements: measurements,
    time_str: midpoint_datetime,
    time: DateTime.fromISO(midpoint_datetime),
    lowerBound: DateTime.fromISO(midpoint_datetime).plus({ minutes: -30 }),
    upperBound: DateTime.fromISO(midpoint_datetime).plus({ minutes: 30 }),
  }
}

const mock_sorted_measurement = (date: string): MeasurementsResponseDto => {
  const resp: MeasurementsResponseDto = {
    api_source: 'OpenAQ',
    entity: 'Governmental Organization',
    location_name: 'São Paulo',
    location_type: 'city',
    location: { latitude: 10, longitude: 20 },
    measurement_date: date,
    sensor_type: 'reference grade',
    site_name: 'Sao Paulo',
  }

  return resp
}
