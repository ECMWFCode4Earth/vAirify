import { expect, test } from '../../utils/fixtures'
import { encodeDateToURIComponent, gotoPage } from '../../utils/helper_methods'

const systemDate: Date = new Date('2024-07-18T14:00:00Z')
const forecastAPIEndpoint = '/forecast'
const httpMethodGet: string = 'GET'

test.describe('API calls on page load', () => {
  test.describe('Forecast endpoint', () => {
    test.describe('Forecast base time boundary value analysis using mocked system time', () => {
      ;[
        {
          dateTime: '2024-07-03T10:00:00Z',
          expectedRequestForecastBaseTime: '2024-07-02T00%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T09:59:00Z',
          expectedRequestForecastBaseTime: '2024-07-01T12%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T21:59:00Z',
          expectedRequestForecastBaseTime: '2024-07-02T00%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T22:00:00Z',
          expectedRequestForecastBaseTime: '2024-07-02T12%3A00%3A00.000Z',
        },
      ].forEach(({ dateTime, expectedRequestForecastBaseTime }) => {
        test(`System time ${dateTime}, assert forecast base time correct`, async ({
          page,
          summaryPage,
          cityPage,
          basePage,
        }) => {
          const mockSystemDate: Date = new Date(dateTime)
          await page.clock.setFixedTime(mockSystemDate)

          const requestArray: string[] =
            await summaryPage.captureNetworkRequestsAsArray(
              page,
              httpMethodGet,
              basePage.baseAPIURL + forecastAPIEndpoint,
            )
          await gotoPage(page, 'city/Rio%20de%20Janeiro')
          await cityPage.waitForAllGraphsToBeVisible()

          expect(requestArray[0]).toContain(
            `base_time=${expectedRequestForecastBaseTime}`,
          )
        })
      })
    })
    test('Verify on page load the forecast API is called once', async ({
      summaryPage,
      cityPage,
      page,
      basePage,
    }) => {
      const requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + forecastAPIEndpoint,
      )
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/Rio%20de%20Janeiro')
      await cityPage.waitForAllGraphsToBeVisible()
      expect(requestArray.length).toEqual(1)
    })
  })
})

test.describe('API calls on changing forecast base time in UI', () => {
  let requestArray: string[]

  test.describe('Forecast endpoint', () => {
    test.beforeEach(
      async ({ page, cityPage, summaryPage, basePage, banner }) => {
        // Load page at UTC 2024-07-18T14:00:00
        await page.clock.setFixedTime(systemDate)
        await gotoPage(page, 'city/Rio%20de%20Janeiro')
        await cityPage.waitForAllGraphsToBeVisible()
        await banner.calendarIcon.click()
        // Select forecast base date UTC 2024-07-03T12:00:00
        await banner.clickOnTime('12:00')
        await banner.calendarIcon.click()
        requestArray = await summaryPage.captureNetworkRequestsAsArray(
          page,
          httpMethodGet,
          basePage.baseAPIURL + forecastAPIEndpoint,
        )
      },
    )

    test('Verify on changing the forecast base time, the forecast API is called once', async ({
      banner,
    }) => {
      await banner.clickOnDay(3)
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on changing the forecast base time, the forecast API call has correct forecast base time', async ({
      banner,
    }) => {
      const expectedForecastBaseTime: string = await encodeDateToURIComponent(
        new Date(`2024-07-03T12:00:00Z`),
      )

      await banner.clickOnDay(3)
      expect(requestArray[0]).toContain(`base_time=${expectedForecastBaseTime}`)
    })
  })
})