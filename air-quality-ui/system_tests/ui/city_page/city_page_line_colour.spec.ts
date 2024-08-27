import { test } from '../../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../../utils/mocked_api'
import {
  CaseAQI1,
  CaseAQI2,
  CaseAQI3,
  CaseAQI4,
  CaseAQI5,
  CaseAQI6,
} from '../../utils/test_enums'

test.beforeEach(async ({ cityPage, page, banner }) => {
  const mockedForecastResponse = [
    //AQI 3
    createForecastAPIResponseData({
      location_name: 'London',
      base_time: '2024-08-27T00:00:00Z',
      valid_time: '2024-08-27T00:00:00Z',
      overall_aqi_level: 3,
      no2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
      o3: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
      pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
      pm10: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
      so2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
    }),
    //AQI 4
    createForecastAPIResponseData({
      location_name: 'London',
      base_time: '2024-08-27T00:00:00Z',
      valid_time: '2024-08-27T03:00:00Z',
      overall_aqi_level: 4,
      no2: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.no2 },
      o3: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.o3 },
      pm2_5: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.pm2_5 },
      pm10: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.pm10 },
      so2: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.so2 },
    }),
  ]
  const mockedMeasurementsCityPageResponse = [
    // Site 1, AQI 1 -> 2
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 1',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 1',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI2.no2,
      o3: CaseAQI2.o3,
      so2: CaseAQI2.so2,
      pm2_5: CaseAQI2.pm2_5,
      pm10: CaseAQI2.pm10,
    }),
    // Site 2, AQI 2 -> 3
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 2',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI3.no2,
      o3: CaseAQI3.o3,
      so2: CaseAQI3.so2,
      pm2_5: CaseAQI3.pm2_5,
      pm10: CaseAQI3.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 2',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    // Site 3, AQI 3 -> 4
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 3',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI3.no2,
      o3: CaseAQI3.o3,
      so2: CaseAQI3.so2,
      pm2_5: CaseAQI3.pm2_5,
      pm10: CaseAQI3.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 3',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    // Site 4, AQI 4 -> 5
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 4',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 4',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI5.no2,
      o3: CaseAQI5.o3,
      so2: CaseAQI5.so2,
      pm2_5: CaseAQI5.pm2_5,
      pm10: CaseAQI5.pm10,
    }),
    // Site 5, AQI 5 -> 6
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 5',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI5.no2,
      o3: CaseAQI5.o3,
      so2: CaseAQI5.so2,
      pm2_5: CaseAQI5.pm2_5,
      pm10: CaseAQI5.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 5',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    // Site 6, AQI 6 -> 1
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 6',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 6',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    // Site 7, AQI 6 -> 2
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 7',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 7',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI2.no2,
      o3: CaseAQI2.o3,
      so2: CaseAQI2.so2,
      pm2_5: CaseAQI2.pm2_5,
      pm10: CaseAQI2.pm10,
    }),
    // Site 8, AQI 6 -> 3
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 8',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 8',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI3.no2,
      o3: CaseAQI3.o3,
      so2: CaseAQI3.so2,
      pm2_5: CaseAQI3.pm2_5,
      pm10: CaseAQI3.pm10,
    }),
    // Site 9, AQI 6 -> 4
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 9',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 9',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    // Site 10, AQI 6 -> 5
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 10',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 10',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI5.no2,
      o3: CaseAQI5.o3,
      so2: CaseAQI5.so2,
      pm2_5: CaseAQI5.pm2_5,
      pm10: CaseAQI5.pm10,
    }),
    // Site 11, AQI 6 -> 6
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 11',
      measurement_date: '2024-08-27T00:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Test Site 11',
      measurement_date: '2024-08-27T03:00:00Z',
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
  ]

  await setupPageWithMockData(page, [
    {
      endpointUrl: '*/**/air-pollutant/forecast*',
      mockedAPIResponse: mockedForecastResponse,
    },
    {
      endpointUrl: '*/**/air-pollutant/measurements*',
      mockedAPIResponse: mockedMeasurementsCityPageResponse,
    },
  ])
  await gotoPage(page, '/city/Rio%20de%20Janeiro')
  await cityPage.waitForAllGraphsToBeVisible()
  await cityPage.setBaseTime('01/07/2024 00:00')
  await banner.confirmDate()
})
