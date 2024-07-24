import { expect, test } from '../../utils/fixtures'
import { encodeDateToURIComponent, gotoPage } from '../../utils/helper_methods'

const httpMethodGet: string = 'GET'

const forecastAPIEndpoint = '/forecast'
const measurementSummaryAPIEndpoint = '/measurements/summary'

test.describe('API calls on page load', () => {
  const systemDate: Date = new Date('2024-06-10T20:00:00Z')

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
        test(`System time ${dateTime}, assert forecast request params are correct`, async ({
          page,
          summaryPage,
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
          await gotoPage(page, 'city/summary')
          await summaryPage.waitForLoad()
          const expectedRequestValidTimeFrom: string =
            expectedRequestForecastBaseTime
          const mockDateTimeNowUriEncoded: string =
            await encodeDateToURIComponent(mockSystemDate)

          expect(requestArray[0]).toContain(
            `location_type=city&valid_time_from=${expectedRequestValidTimeFrom}&valid_time_to=${mockDateTimeNowUriEncoded}&base_time=${expectedRequestForecastBaseTime}`,
          )
        })
      })
    })
    test('Verify on page load the forecast API is called once', async ({
      summaryPage,
      page,
      basePage,
    }) => {
      const requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + forecastAPIEndpoint,
      )
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      expect(requestArray.length).toEqual(1)
    })
  })

  test.describe('Measurements Summary endpoint', () => {
    let requestArray: string[]

    test.beforeEach(async ({ page, summaryPage, basePage }) => {
      requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + measurementSummaryAPIEndpoint,
      )
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
    })

    test('Verify on page load the measurement summary API is called proportionately', async () => {
      expect(requestArray.length).toEqual(15)
    })

    test('Verify on page load the measurement summary API calls have correct params', async () => {
      const expectedMeasurementBaseTimeArray = [
        '2024-06-09T00%3A00%3A00.000Z',
        '2024-06-09T03%3A00%3A00.000Z',
        '2024-06-09T06%3A00%3A00.000Z',
        '2024-06-09T09%3A00%3A00.000Z',
        '2024-06-09T12%3A00%3A00.000Z',
        '2024-06-09T15%3A00%3A00.000Z',
        '2024-06-09T18%3A00%3A00.000Z',
        '2024-06-09T21%3A00%3A00.000Z',
        '2024-06-10T00%3A00%3A00.000Z',
        '2024-06-10T03%3A00%3A00.000Z',
        '2024-06-10T06%3A00%3A00.000Z',
        '2024-06-10T09%3A00%3A00.000Z',
        '2024-06-10T12%3A00%3A00.000Z',
        '2024-06-10T15%3A00%3A00.000Z',
        '2024-06-10T18%3A00%3A00.000Z',
      ]
      for (const request in requestArray) {
        expect(requestArray[request]).toContain(
          `measurement_base_time=${expectedMeasurementBaseTimeArray[request]}&measurement_time_range=90&location_type=city`,
        )
      }
    })
  })
})
test.describe('API calls on changing forecast base time in UI', () => {
  const systemDate: Date = new Date('2024-07-18T14:00:00Z')
  const newForecastBaseTimeDay: number = 3
  let requestArray: string[]

  test.describe('Forecast endpoint', () => {
    test.beforeEach(async ({ page, summaryPage, basePage, banner }) => {
      // Load page at UTC 2024-07-18T14:00:00
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      await basePage.clickLocator(banner.calendarIcon)
      // Select forecast base date UTC 2024-07-03T00:00:00
      requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + forecastAPIEndpoint,
      )
    })

    test('Verify on changing the forecast base time, the forecast API is called once', async ({
      banner,
    }) => {
      await banner.clickOnDay(newForecastBaseTimeDay)
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on changing the forecast base time, the forecast API call has correct params', async ({
      banner,
    }) => {
      const expectedForecastBaseTime: string = await encodeDateToURIComponent(
        new Date(`2024-07-0${newForecastBaseTimeDay}T00:00:00Z`),
      )
      const expectedValidTimeFrom: string = expectedForecastBaseTime
      const systemDateUriEncoded: string =
        await encodeDateToURIComponent(systemDate)

      await banner.clickOnDay(newForecastBaseTimeDay)
      expect(requestArray[0]).toContain(
        `location_type=city&valid_time_from=${expectedValidTimeFrom}&valid_time_to=${systemDateUriEncoded}&base_time=${expectedForecastBaseTime}`,
      )
    })
  })
  test.describe('Measurements Summary endpoint', () => {
    let requestArray: string[]

    test.beforeEach(async ({ page, summaryPage, basePage, banner }) => {
      // Load page at UTC 2024-07-18T14:00:00
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      await basePage.clickLocator(banner.calendarIcon)
      // Select forecast base date UTC 2024-07-03T00:00:00
      requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + measurementSummaryAPIEndpoint,
      )
    })

    test.describe('On changing the forecast base time, the measurement summary API is called proportionately', () => {
      ;[
        {
          day: (systemDate.getDay() - 2),
          expectedNumberOfRequests: '2024-07-02T00%3A00%3A00.000Z',
        },
        {
          dateTime: systemDate.getDay() - 6,
          expectedNumberOfRequests: '2024-07-01T12%3A00%3A00.000Z',
        },
      ].forEach(({ day, expectedNumberOfRequests }) => {
    test('Verify on changing the forecast base time, the measurement summary API is called proportionately', async ({
      banner,
    }) => {
      await banner.clickOnDay(day)
      console.log(requestArray)
      expect(requestArray.length).toEqual(expectedNumberOfRequests)
    })

    test('Verify on changing the forecast base time, the measurement summary API calls have correct params', async ({
      summaryPage,
      page,
      basePage,
    }) => {
      const requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + measurementSummaryAPIEndpoint,
      )
      await page.clock.setFixedTime(systemTime)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      const expectedMeasurementBaseTimeArray = [
        '2024-06-09T00%3A00%3A00.000Z',
        '2024-06-09T03%3A00%3A00.000Z',
        '2024-06-09T06%3A00%3A00.000Z',
        '2024-06-09T09%3A00%3A00.000Z',
        '2024-06-09T12%3A00%3A00.000Z',
        '2024-06-09T15%3A00%3A00.000Z',
        '2024-06-09T18%3A00%3A00.000Z',
        '2024-06-09T21%3A00%3A00.000Z',
        '2024-06-10T00%3A00%3A00.000Z',
        '2024-06-10T03%3A00%3A00.000Z',
        '2024-06-10T06%3A00%3A00.000Z',
        '2024-06-10T09%3A00%3A00.000Z',
        '2024-06-10T12%3A00%3A00.000Z',
        '2024-06-10T15%3A00%3A00.000Z',
        '2024-06-10T18%3A00%3A00.000Z',
      ]
      for (const request in requestArray) {
        expect(requestArray[request]).toContain(
          `measurement_base_time=${expectedMeasurementBaseTimeArray[request]}&measurement_time_range=90&location_type=city`,
        )
      }
    })
  })
})
