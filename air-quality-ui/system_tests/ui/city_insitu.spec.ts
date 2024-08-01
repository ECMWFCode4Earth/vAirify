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

test.describe('AQI is 3 at 00:00', () => {
  test.beforeEach(async ({ page, cityPage }) => {
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
        overall_aqi_level: 2,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-01T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 3,
      }),
    ]

    const mockedMeasurementsCityPageResponse = [
      //Lower bound 00:00
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-06-30T23:29:59Z',
        pm2_5: 800,
        pm10: 1200,
        so2: 1250,
        no2: 1000,
        o3: 800,
        site_name: 'Tijuca',
      }),

      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        pm2_5: 10,
        pm10: 20,
        so2: 100,
        no2: 40,
        o3: 50,
        site_name: 'Tijuca',
      }),
      // upper bound of 00:00
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:30:00Z',
        pm2_5: 800,
        pm10: 1200,
        so2: 1250,
        no2: 1000,
        o3: 800,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        pm2_5: 20,
        pm10: 40,
        so2: 200,
        no2: 90,
        o3: 100,
        site_name: 'AQI 2 Site',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        pm2_5: 25,
        pm10: 50,
        so2: 350,
        no2: 120,
        o3: 130,
        site_name: 'AQI 3 site',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        pm2_5: 50,
        pm10: 100,
        so2: 500,
        no2: 230,
        o3: 240,
        site_name: 'AQI 4 site',
      }),

      //AQI 2 values
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T01:00:00Z',
        pm2_5: 20,
        pm10: 40,
        so2: 200,
        no2: 90,
        o3: 100,
        site_name: 'Tijuca',
      }),
      //AQI 3 values
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T02:00:00Z',
        pm2_5: 25,
        pm10: 50,
        so2: 350,
        no2: 120,
        o3: 130,
        site_name: 'Tijuca',
      }),
      //AQI 4 values
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T03:00:00Z',
        pm2_5: 50,
        pm10: 100,
        so2: 500,
        no2: 230,
        o3: 240,
        site_name: 'Tijuca',
      }),
      //AQI 5 values
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T04:00:00Z',
        pm2_5: 75,
        pm10: 150,
        so2: 750,
        no2: 340,
        o3: 380,
        site_name: 'Tijuca',
      }),
      //AQI 6 values
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T05:00:00Z',
        pm2_5: 800,
        pm10: 1200,
        so2: 1250,
        no2: 1000,
        o3: 800,
        site_name: 'Tijuca',
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
  })

  test('Expect in-situ AQI 3 plot at 00:00 due to PM2.5', async ({
    cityPage,
  }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.aqiChart)
    await expect(chartShot).toMatchSnapshot('Midnight-AQI-3.png')
  })

  test('Expect in-situ AQI 2 when AQI site 4 is removed due to PM2.5', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('AQI 4 site')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.aqiChart)
    await expect(chartShot).toMatchSnapshot('Midnight-AQI-2.png')
  })

  test('Expect in-situ AQI at 00:00 to be 3 when a site is removed and reselected', async ({
    cityPage,
    page,
  }) => {
    await cityPage.siteRemover('AQI 4 site')
    page.reload()
    await waitForIdleNetwork(page, cityPage.aqiChart)
    await cityPage.setBaseTime('01/07/2024 00:00')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.aqiChart)
    await expect(chartShot).toMatchSnapshot('Midnight-AQI-3.png')
  })
})
