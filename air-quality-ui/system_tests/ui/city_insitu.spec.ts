import { expect, test } from '../utils/fixtures'
import {
  gotoPage,
  setupPageWithMockData,
  waitForIdleNetwork,
} from '../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../utils/mocked_api'

test.use({
  viewport: { width: 1920, height: 1080 },
})

test('Pm25 ONLY', async ({ page, cityPage }) => {
  const mockedForecastResponse = [
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T00:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 1,
    }),
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T03:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 3,
    }),
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T06:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 6,
    }),
  ]
  const mockedMeasurementsCityPageResponse = [
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T00:00:00Z',
      pm2_5: 10,
      pm10: 20,
      so2: 100,
      no2: 40,
      o3: 50,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T01:00:00Z',
      pm2_5: 20,
      pm10: 40,
      so2: 200,
      no2: 90,
      o3: 100,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T02:00:00Z',
      pm2_5: 25,
      pm10: 50,
      so2: 350,
      no2: 120,
      o3: 130,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T03:00:00Z',
      pm2_5: 50,
      pm10: 100,
      so2: 500,
      no2: 230,
      o3: 240,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T04:00:00Z',
      pm2_5: 75,
      pm10: 150,
      so2: 750,
      no2: 340,
      o3: 380,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T05:00:00Z',
      pm2_5: 800,
      pm10: 1200,
      so2: 1250,
      no2: 1000,
      o3: 800,
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T05:00:00Z',
      no2: 15,
      o3: 20,
      so2: 30,
      pm2_5: 20,
      pm10: 20,
      site_name: 'Copacabana',
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T05:00:00Z',
      no2: 200,
      o3: 120,
      so2: 80,
      pm2_5: 130,
      pm10: 70,
      site_name: 'Tijuca',
    }),
  ]

  await setupPageWithMockData(page, [
    {
      endpointUrl: '*/**/air-pollutant/forecast*',
      mockedAPIResponse: mockedForecastResponse,
    },
    {
      endpointUrl: '*/**/air-pollutant/measurments*',
      mockedAPIResponse: mockedMeasurementsCityPageResponse,
    },
  ])
  await gotoPage(page, '/city/Rio%20de%20Janeiro')
  await cityPage.waitForAllGraphsToBeVisible()
  await cityPage.setBaseTime('01/07/2024 00:00')
  await waitForIdleNetwork(page, cityPage.pm2_5Chart)
  await page.waitForTimeout(5000)
})
