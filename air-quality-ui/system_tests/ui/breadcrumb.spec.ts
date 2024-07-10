import { expect, test } from '../utils/fixtures'
import {
  createForecastAPIResponseData,
  createMeasurementSummaryAPIResponseData,
} from '../utils/mocked_api'

test('Mocked response breadcrumb', async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  const mockedForecastResponse = [
    createForecastAPIResponseData({
      base_time: '2024-06-19T00:00:00Z',
      valid_time: '2024-06-19T09:00:00Z',
      location_type: 'city',
      location_name: 'Kampala',
    }),
    createForecastAPIResponseData({
      base_time: '2024-06-19T00:00:00Z',
      valid_time: '2024-06-19T12:00:00Z',
      location_type: 'city',
      location_name: 'Abu Dhabi',
    }),
    createForecastAPIResponseData({
      base_time: '2024-06-19T00:00:00Z',
      valid_time: '2024-06-19T12:00:00Z',
      location_type: 'city',
      location_name: 'Zurich',
    }),
    createForecastAPIResponseData({
      base_time: '2024-06-24T00:00:00Z',
      valid_time: '2024-06-24T09:00:00Z',
      location_type: 'city',
      location_name: 'Kyiv',
    }),
  ]

  const mockedMeasurementSummaryResponse = [
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-06-19T09:00:00Z',
      location_name: 'Kampala',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-06-19T12:00:00Z',
      location_name: 'Abu Dhabi',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-06-19T12:00:00Z',
      location_name: 'Zurich',
    }),
  ]
  await vairifySummaryPage.setupPageWithMockData(
    mockedForecastResponse,
    mockedMeasurementSummaryResponse,
  )
  await vairifySummaryPage.clickButton('Kampala')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Kampala')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Abu Dhabi')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Abu Dhabi')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Zurich')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Zurich')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')
})
