import { expect, test } from '../../utils/fixtures'
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

test.beforeEach(async ({ page, cityPage }) => {
  const date0000: string = '2024-08-27T00:00:00Z'
  const date0300: string = '2024-08-27T03:00:00Z'
  const locationLondon: string = 'London'
  const testSite1: string = 'Test Site 1'
  const testSite2: string = 'Test Site 2'
  const testSite3: string = 'Test Site 3'
  const testSite4: string = 'Test Site 4'
  const testSite5: string = 'Test Site 5'
  const testSite6: string = 'Test Site 6'
  const testSite7: string = 'Test Site 7'
  const testSite8: string = 'Test Site 8'
  const testSite9: string = 'Test Site 9'
  const testSite10: string = 'Test Site 10'
  const testSite11: string = 'Test Site 11'

  const mockedForecastResponse = [
    //AQI 3
    createForecastAPIResponseData({
      location_name: locationLondon,
      base_time: date0000,
      valid_time: date0000,
      overall_aqi_level: 3,
      no2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
      o3: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
      pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
      pm10: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
      so2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
    }),
    //AQI 4
    createForecastAPIResponseData({
      location_name: locationLondon,
      base_time: date0000,
      valid_time: date0300,
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
      location_name: locationLondon,
      site_name: testSite1,
      measurement_date: date0000,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite1,
      measurement_date: date0300,
      no2: CaseAQI2.no2,
      o3: CaseAQI2.o3,
      so2: CaseAQI2.so2,
      pm2_5: CaseAQI2.pm2_5,
      pm10: CaseAQI2.pm10,
    }),
    // Site 2, AQI 1 -> 3
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite2,
      measurement_date: date0000,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite2,
      measurement_date: date0300,
      no2: CaseAQI3.no2,
      o3: CaseAQI3.o3,
      so2: CaseAQI3.so2,
      pm2_5: CaseAQI3.pm2_5,
      pm10: CaseAQI3.pm10,
    }),
    // Site 3, AQI 1 -> 4
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite3,
      measurement_date: date0000,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite3,
      measurement_date: date0300,
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    // Site 4, AQI 1 -> 5
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite4,
      measurement_date: date0000,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite4,
      measurement_date: date0300,
      no2: CaseAQI5.no2,
      o3: CaseAQI5.o3,
      so2: CaseAQI5.so2,
      pm2_5: CaseAQI5.pm2_5,
      pm10: CaseAQI5.pm10,
    }),
    // Site 5, AQI 1 -> 6
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite5,
      measurement_date: date0000,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite5,
      measurement_date: date0300,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    // Site 6, AQI 6 -> 1
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite6,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite6,
      measurement_date: date0300,
      no2: CaseAQI1.no2,
      o3: CaseAQI1.o3,
      so2: CaseAQI1.so2,
      pm2_5: CaseAQI1.pm2_5,
      pm10: CaseAQI1.pm10,
    }),
    // Site 7, AQI 6 -> 2
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite7,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite7,
      measurement_date: date0300,
      no2: CaseAQI2.no2,
      o3: CaseAQI2.o3,
      so2: CaseAQI2.so2,
      pm2_5: CaseAQI2.pm2_5,
      pm10: CaseAQI2.pm10,
    }),
    // Site 8, AQI 6 -> 3
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite8,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite8,
      measurement_date: date0300,
      no2: CaseAQI3.no2,
      o3: CaseAQI3.o3,
      so2: CaseAQI3.so2,
      pm2_5: CaseAQI3.pm2_5,
      pm10: CaseAQI3.pm10,
    }),
    // Site 9, AQI 6 -> 4
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite9,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite9,
      measurement_date: date0300,
      no2: CaseAQI4.no2,
      o3: CaseAQI4.o3,
      so2: CaseAQI4.so2,
      pm2_5: CaseAQI4.pm2_5,
      pm10: CaseAQI4.pm10,
    }),
    // Site 10, AQI 6 -> 5
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite10,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite10,
      measurement_date: date0300,
      no2: CaseAQI5.no2,
      o3: CaseAQI5.o3,
      so2: CaseAQI5.so2,
      pm2_5: CaseAQI5.pm2_5,
      pm10: CaseAQI5.pm10,
    }),
    // Site 11, AQI 6 -> 6
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite11,
      measurement_date: date0000,
      no2: CaseAQI6.no2,
      o3: CaseAQI6.o3,
      so2: CaseAQI6.so2,
      pm2_5: CaseAQI6.pm2_5,
      pm10: CaseAQI6.pm10,
    }),
    createMeasurementsCityPageResponseData({
      location_name: locationLondon,
      site_name: testSite11,
      measurement_date: date0300,
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
  await gotoPage(page, '/city/London')
  await cityPage.waitForAllGraphsToBeVisible()
})

test(`With greater than 10 stations, the pm10 chart uses the correct line colours`, async ({
  cityPage,
}) => {
  const chartShot = await cityPage.captureChartScreenshot(cityPage.pm10Chart)
  expect(chartShot).toMatchSnapshot('london-pm10-graph.png')
})

test(`With greater than 10 stations, the pm2.5 chart uses the correct line colours`, async ({
  cityPage,
}) => {
  const chartShot = await cityPage.captureChartScreenshot(cityPage.pm2_5Chart)
  expect(chartShot).toMatchSnapshot('london-pm2_5-graph.png')
})

test(`With greater than 10 stations, the no2 chart uses the correct line colours`, async ({
  cityPage,
}) => {
  const chartShot = await cityPage.captureChartScreenshot(cityPage.no2Chart)
  expect(chartShot).toMatchSnapshot('london-no2-graph.png')
})

test(`With greater than 10 stations, the o3 chart uses the correct line colours`, async ({
  cityPage,
}) => {
  const chartShot = await cityPage.captureChartScreenshot(cityPage.o3Chart)
  expect(chartShot).toMatchSnapshot('london-o3-graph.png')
})

test(`With greater than 10 stations, the so2 chart uses the correct line colours`, async ({
  cityPage,
}) => {
  const chartShot = await cityPage.captureChartScreenshot(cityPage.so2Chart)
  expect(chartShot).toMatchSnapshot('london-so2-graph.png')
})
