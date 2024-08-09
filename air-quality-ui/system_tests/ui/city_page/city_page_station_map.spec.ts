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
        site_name: 'Test Site North',
        location: {
          longitude: test_longitude,
          latitude: test_latitude + station_distance_degs,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site South',
        location: {
          longitude: test_longitude,
          latitude: test_latitude - station_distance_degs,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site West',
        location: {
          longitude: test_longitude - station_distance_degs,
          latitude: test_latitude,
        },
      }),
      createMeasurementsCityPageResponseData({
        site_name: 'Test Site East',
        location: {
          longitude: test_longitude + station_distance_degs,
          latitude: test_latitude,
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
  test('is displayed correctly when measurement stations are toggled outside the map', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Test Site Centre')
    await cityPage.siteRemover('Test Site North')
    const mapSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(mapSnapshot).toMatchSnapshot(
      'kampala-removed-stations-outside-map.png',
    )
  })
  test('is displayed correctly when measurement stations are toggled from inside the map', async ({
    cityPage,
  }) => {
    // Select station to open modal
    await cityPage.mapStationClick(0)
    const selectStationSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(selectStationSnapshot).toMatchSnapshot(
      'kampala-selected-station-inside-map.png',
    )

    // Remove station
    await cityPage.mapStationPopupButtonClick('remove')
    const removedStationSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(removedStationSnapshot).toMatchSnapshot(
      'kampala-removed-station-inside-map.png',
    )

    // Reselect station to reopen modal (which has been recreated and thus is now at the end)
    await cityPage.mapStationClick(4)
    const selectDisabledStationSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(selectDisabledStationSnapshot).toMatchSnapshot(
      'kampala-selected-disabled-station-inside-map.png',
    )

    // Re-add station
    cityPage.mapStationPopupButtonClick('add')
    const readdedStationSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(readdedStationSnapshot).toMatchSnapshot(
      'kampala-all-station-map.png',
    )
  })
  test('removes open toggle dialogue if a different station is selected', async ({
    cityPage,
  }) => {
    // Select station to open modal
    await cityPage.mapStationClick(0)
    const selectStationSnapshot = await cityPage.captureChartScreenshot(
      cityPage.stationMap,
    )
    expect(selectStationSnapshot).toMatchSnapshot(
      'kampala-selected-station-inside-map.png',
    )

    // Select a different station to reopen modal
    await cityPage.mapStationClick(1)
    const selectAlternateStationSelectedSnapshot =
      await cityPage.captureChartScreenshot(cityPage.stationMap)
    expect(selectAlternateStationSelectedSnapshot).toMatchSnapshot(
      'kampala-alternate-station-selected-inside-map.png',
    )
  })
})
