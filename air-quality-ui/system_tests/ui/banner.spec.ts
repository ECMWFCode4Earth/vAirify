import { expect, test } from '../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementSummaryAPIResponseData,
} from '../utils/mocked_api'

test.describe('Logo visibility', () => {
  ;[
    {
      url: '/city/Rio%20de%20Janeiro',
      pageType: 'city',
    },
    {
      url: '/city/summary',
      pageType: 'summary',
    },
  ].forEach(({ url, pageType }) => {
    test(`vAirify logo is visible on ${pageType} page`, async ({
      page,
      banner,
    }) => {
      await gotoPage(page, url)
      await expect(banner.logo).toBeVisible()
    })
  })
})

test.describe('Date Picker', () => {
  ;[
    {
      url: '/city/Rio%20de%20Janeiro',
      pageType: 'city',
    },
    {
      url: '/city/summary',
      pageType: 'summary',
    },
  ].forEach(({ url, pageType }) => {
    test(`Date picker is visible and cannot select a future day on ${pageType} page`, async ({
      page,
      banner,
    }) => {
      const mockSystemDate: Date = new Date('2024-07-26T10:00:00Z')
      await page.clock.setFixedTime(mockSystemDate)

      await gotoPage(page, url)
      await expect(banner.datePicker).toBeVisible()

      await banner.calendarIcon.click()
      await expect(banner.day27).toBeDisabled()
      await expect(banner.datePickerNextMonthButton).toBeDisabled()

      await banner.datePickerYearButton.click()
      await expect(banner.year2025).toBeDisabled()
      // add assertion you can't send keys for a future date, blocked by bug
    })
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
  await setupPageWithMockData(page, [
    {
      endpointUrl: '*/**/air-pollutant/forecast*',
      mockedAPIResponse: mockedForecastResponse,
    },
    {
      endpointUrl: '*/**/air-pollutant/measurements/summary*',
      mockedAPIResponse: mockedMeasurementSummaryResponse,
    },
  ])
  await gotoPage(page, '/city/summary')
  await summaryPage.clickLinkByText('Kampala')
  await expect(cityPage.toolbarTextFinder('Cities/Kampala')).toBeVisible()
  await summaryPage.clickLinkByText('Cities')

  await summaryPage.clickLinkByText('Abu Dhabi')
  await expect(cityPage.toolbarTextFinder('Cities/Abu Dhabi')).toBeVisible()
  await summaryPage.clickLinkByText('Cities')

  await summaryPage.clickLinkByText('Zurich')
  await expect(cityPage.toolbarTextFinder('Cities/Zurich')).toBeVisible()
  await summaryPage.clickLinkByText('Cities')
})
