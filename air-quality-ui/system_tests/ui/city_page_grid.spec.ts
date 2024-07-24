import { expect, test } from '../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../utils/mocked_api'

test.use({
  viewport: { width: 1920, height: 1080 },
})

test.describe('Charts are visible in immediate view', () => {
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
        overall_aqi_level: 4,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-01T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 3,
      }),
    ]
    await setupPageWithMockData(page, [
      {
        endpointUrl: '*/**/air-pollutant/forecast*',
        mockedAPIResponse: mockedForecastResponse,
      },
    ])
    await gotoPage(page, '/city/Rio%20de%20Janeiro')
    await cityPage.waitForAllGraphsToBeVisible()
    await cityPage.setBaseTime('01/07/2024 00:00')
  })
  test('AQI chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.aqiChart).toBeInViewport()
  })
  test('pm2.5 chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.pm2_5Chart).toBeInViewport()
  })
  test('pm10 chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.pm10Chart).toBeInViewport()
  })
  test('o3 chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.o3Chart).toBeInViewport()
  })
  test('no2 chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.no2Chart).toBeInViewport()
  })
  test('so2 chart element is visible in fullscreen view', async ({
    cityPage,
  }) => {
    await expect(cityPage.so2Chart).toBeInViewport()
  })
})
