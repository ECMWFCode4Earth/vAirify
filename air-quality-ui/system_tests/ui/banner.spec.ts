import { expect, test } from '../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementSummaryAPIResponseData,
} from '../utils/mocked_api'

test.describe('City page', () => {
  test('vAirify logo is visible on city page', async ({ page, banner }) => {
    await gotoPage(page, '/city/Rio%20de%20Janeiro')
    await expect(banner.logo).toBeVisible()
  })
})

test.describe('Summary page', () => {
  test.beforeEach(async ({ summaryPage }) => {
    await summaryPage.goTo()
  })
  test('vAirify logo is visible on summary page', async ({ banner }) => {
    await expect(banner.logo).toBeVisible()
  })

  test('Verify page title is vAirify on summary page', async ({
    summaryPage,
  }) => {
    const title = await summaryPage.getTitle()
    expect(title).toBe('vAirify')
  })
})

test('Verify breadcrumb text is correct on each page', async ({
  summaryPage,
  cityPage,
  page,
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
  await setupPageWithMockData(
    page,
    [
      {
        endpointUrl: '*/**/air-pollutant/forecast*',
        mockedAPIResponse: mockedForecastResponse,
      },
      {
        endpointUrl: '*/**/air-pollutant/measurements/summary*',
        mockedAPIResponse: mockedMeasurementSummaryResponse,
      },
    ],
    '/city/summary',
  )
  await summaryPage.clickButton('Kampala')
  await expect(cityPage.toolbarTextFinder('Cities/Kampala')).toBeVisible()
  await summaryPage.clickButton('Cities')

  await summaryPage.clickButton('Abu Dhabi')
  await expect(cityPage.toolbarTextFinder('Cities/Abu Dhabi')).toBeVisible()
  await summaryPage.clickButton('Cities')

  await summaryPage.clickButton('Zurich')
  await expect(cityPage.toolbarTextFinder('Cities/Zurich')).toBeVisible()
  await summaryPage.clickButton('Cities')
})
