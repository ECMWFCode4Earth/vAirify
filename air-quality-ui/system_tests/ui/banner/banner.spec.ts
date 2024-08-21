import { expect, test } from '../../utils/fixtures'
import { gotoPage, setupPageWithMockData } from '../../utils/helper_methods'
import { createForecastAPIResponseData } from '../../utils/mocked_api'
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
  test.describe('Basic checks', () => {
    test.beforeEach(async ({ page }) => {
      await gotoPage(page, url)
    }),
      test(`vAirify logo is correct on ${pageType} page`, async ({
        banner,
      }) => {
        await banner.logo.scrollIntoViewIfNeeded()
        const logoShot = await banner.logo.screenshot()
        expect(logoShot).toMatchSnapshot('vAirify-logo.png')
      }),
      test(`Date picker is visible on ${pageType} page`, async ({ banner }) => {
        await expect(banner.datePicker).toBeVisible()
      })
    test(`Verify date picker times can only be 12:00 or 00:00 on ${pageType} page`, async ({
      banner,
    }) => {
      await banner.calendarIcon.click()

      await expect(banner.datePickerTimeOptions).toHaveCount(2)
      await expect(banner.datePickerTimeOption0000).toBeVisible()
      await expect(banner.datePickerTimeOption1200).toBeVisible()
    })
  })
})
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
  test.describe('Future dates and times are not possible', () => {
    test.beforeEach(async ({ page, banner }) => {
      const mockSystemDate: Date = new Date('2024-07-26T10:00:00Z')

      await page.clock.setFixedTime(mockSystemDate)
      await gotoPage(page, url)
      await banner.calendarIcon.click()
    }),
      test(`Date picker cannot select a future day on ${pageType} page`, async ({
        banner,
      }) => {
        await expect(banner.futureDay27).toBeDisabled()
      }),
      test(`Date picker cannot select a future month on ${pageType} page`, async ({
        banner,
      }) => {
        await expect(banner.datePickerNextMonthButton).toBeDisabled()
      }),
      test(`Date picker cannot select a future year on ${pageType} page`, async ({
        banner,
      }) => {
        await banner.datePickerYearOpenButton.click()
        await expect(banner.year2025).toBeDisabled()
      }),
      test(`Date picker cannot select a future time on ${pageType} page`, async ({
        banner,
      }) => {
        await banner.clickOnDay(26)

        await expect(banner.datePickerTimeOptions).toHaveCount(1)
        await expect(banner.datePickerTimeOption1200).not.toBeVisible()
      })
  })
})
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
  test.describe(`Change forecast date with ok button on ${pageType} page`, () => {
    const httpMethodGet: string = 'GET'
    const forecastAPIEndpoint = '/forecast'
    const measurementAPIEndpoint = '/measurement'
    let forecastRequestArray: string[]
    let measurementRequestArray: string[]

    test.beforeEach(async ({ page, banner, basePage }) => {
      const mockSystemDate: Date = new Date('2024-07-26T10:00:00Z')

      await page.clock.setFixedTime(mockSystemDate)
      await gotoPage(page, url)
      await banner.calendarIcon.click()

      forecastRequestArray = await basePage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + forecastAPIEndpoint,
      )

      measurementRequestArray = await basePage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + measurementAPIEndpoint,
      )
    })
    test.describe('when not clicking ok button', () => {
      test('Verify no updates on date selection', async ({ banner }) => {
        await banner.clickOnDay(3)
        await expect(forecastRequestArray.length).toBe(0)
        await expect(measurementRequestArray.length).toBe(0)
      })
      test('Verify no updates on time selection', async ({ banner }) => {
        await banner.clickOnTime('12:00')
        await expect(forecastRequestArray.length).toBe(0)
        await expect(measurementRequestArray.length).toBe(0)
      })
      test('Verify no updates on date and time selection', async ({
        banner,
      }) => {
        await banner.clickOnDay(3)
        await banner.clickOnTime('12:00')
        await expect(forecastRequestArray.length).toBe(0)
        await expect(measurementRequestArray.length).toBe(0)
      })
    })
    test.describe('when clicking ok button', () => {
      test('Verify updates on date selection', async ({ banner }) => {
        await banner.clickOnDay(3)
        await banner.confirmDate()
        await expect(forecastRequestArray.length).toBeGreaterThan(0)
        await expect(measurementRequestArray.length).toBeGreaterThan(0)
      })
      test('Verify updates on time selection', async ({ banner }) => {
        await banner.clickOnTime('12:00')
        await banner.confirmDate()
        await banner.calendarIcon.click()
        await banner.clickOnTime('00:00')
        await banner.confirmDate()
        await expect(forecastRequestArray.length).toBeGreaterThan(0)
        await expect(measurementRequestArray.length).toBeGreaterThan(0)
      })
      test('Verify updates on date and time selection', async ({ banner }) => {
        await banner.clickOnDay(3)
        await banner.clickOnTime('12:00')
        await banner.confirmDate()
        await expect(forecastRequestArray.length).toBeGreaterThan(0)
        await expect(measurementRequestArray.length).toBeGreaterThan(0)
      })
    })
  })
})

test.describe('Range label', () => {
  test.beforeEach(async ({ page }) => {
    const mockSystemDate: Date = new Date('2024-07-26T10:00:00Z')

    await page.clock.setFixedTime(mockSystemDate)
    await gotoPage(page, '/city/summary')
  })

  test('On load, label accurately displays forecast range on summary page', async ({
    summaryPage,
  }) => {
    await expect(summaryPage.timeRange).toContainText(
      'Time Range: 25 Jul 00:00 - 26 Jul 00:00 UTC',
    )
  })

  test('On changing to historic forecast base time (T-6), label accurately displays forecast range on summary page', async ({
    summaryPage,
    banner,
  }) => {
    await banner.setBaseTime('20/07/2024 00:00')
    await banner.confirmDate()
    await expect(summaryPage.timeRange).toContainText(
      'Time Range: 20 Jul 00:00 - 21 Jul 00:00 UTC',
    )
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
  ]

  await setupPageWithMockData(page, [
    {
      endpointUrl: '*/**/air-pollutant/forecast*',
      mockedAPIResponse: mockedForecastResponse,
    },
  ])
  await gotoPage(page, '/city/summary')
  await summaryPage.clickLinkByText('Kampala')
  await expect(cityPage.toolbarTextFinder('Cities/Kampala')).toBeVisible()
  await summaryPage.clickLinkByText('Cities')
})
