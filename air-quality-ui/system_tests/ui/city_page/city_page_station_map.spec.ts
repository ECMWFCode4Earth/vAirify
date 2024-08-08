import { expect, test } from '../../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../../utils/mocked_api'

test.use({
  viewport: { width: 1920, height: 1080 },
})
test.describe('Station map', () => {
  test.beforeEach(async ({ cityPage, page }) => {
    // Kampala co-ords, as 0.2 deg is roughly 25 kms near the equator
    const test_longitude = 32.58219
    const test_latitude = 0.31628
    const station_distance_degs = 0.2
    const mockedForecastResponse = [
      createForecastAPIResponseData({
        location_name: 'Kampala',
        location: { longitude: test_longitude, latitude: test_latitude },
      }),
    ]
    const mockedMeasurementsCityPageResponse = [
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site Centre',
        location: {
          longitude: test_longitude,
          latitude: test_latitude,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site North East',
        location: {
          longitude: test_longitude + station_distance_degs,
          latitude: test_latitude + station_distance_degs,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site South East',
        location: {
          longitude: test_longitude + station_distance_degs,
          latitude: test_latitude - station_distance_degs,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site South West',
        location: {
          longitude: test_longitude - station_distance_degs,
          latitude: test_latitude - station_distance_degs,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site North West',
        location: {
          longitude: test_longitude - station_distance_degs,
          latitude: test_latitude + station_distance_degs,
        },
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
    await gotoPage(page, '/city/Kampala')
    await cityPage.waitForStationMapToBeVisible()
  })
  test('is displayed correctly with measurement stations', async ({
    cityPage,
  }) => {
    const mapSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(mapSnapshot).toMatchSnapshot('kampala-all-station-map.png')
  })
})
