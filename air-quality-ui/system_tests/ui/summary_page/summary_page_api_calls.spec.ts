import { expect, test } from '../../utils/fixtures'
import { encodeDateToURIComponent, gotoPage } from '../../utils/helper_methods'

const systemDate: Date = new Date('2024-07-18T14:00:00Z')
const forecastAPIEndpoint = '/forecast'
const measurementSummaryAPIEndpoint = '/measurements/summary'
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
      expect(requestArray.length).toEqual(9)
    })

    test('Verify on page load the measurement summary API calls have correct params', async () => {
      const expectedMeasurementBaseTimeArray = [
        '2024-07-17T00%3A00%3A00.000Z',
        '2024-07-17T03%3A00%3A00.000Z',
        '2024-07-17T06%3A00%3A00.000Z',
        '2024-07-17T09%3A00%3A00.000Z',
        '2024-07-17T12%3A00%3A00.000Z',
        '2024-07-17T15%3A00%3A00.000Z',
        '2024-07-17T18%3A00%3A00.000Z',
        '2024-07-17T21%3A00%3A00.000Z',
        '2024-07-18T00%3A00%3A00.000Z',
        '2024-07-18T03%3A00%3A00.000Z',
        '2024-07-18T06%3A00%3A00.000Z',
        '2024-07-18T09%3A00%3A00.000Z',
        '2024-07-18T12%3A00%3A00.000Z',
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
  let requestArray: string[]

  test.describe('Forecast endpoint', () => {
    test.beforeEach(async ({ page, summaryPage, basePage, banner }) => {
      // Load page at UTC 2024-07-18T14:00:00
      await page.clock.setFixedTime(systemDate)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      await banner.calendarIcon.click()
      // Select forecast base date UTC 2024-07-03T12:00:00
      await banner.clickOnTime('12:00')
      await banner.calendarIcon.click()
      requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + forecastAPIEndpoint,
      )
    })

    test('Verify on changing the forecast base time, the forecast API is called once', async ({
      banner,
    }) => {
      await banner.clickOnDay(3)
      await banner.confirmDate()
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on changing the forecast base time, the forecast API call has correct params', async ({
      banner,
    }) => {
      const expectedForecastBaseTime: string = await encodeDateToURIComponent(
        new Date(`2024-07-03T12:00:00Z`),
      )
      const expectedValidTimeFrom: string = expectedForecastBaseTime
      const systemDateUriEncoded: string =
        await encodeDateToURIComponent(systemDate)

      await banner.clickOnDay(3)
      await banner.confirmDate()
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
      await banner.calendarIcon.click()
      // Select forecast base date UTC 2024-07-03T12:00:00
      await banner.clickOnTime('12:00')
      await banner.calendarIcon.click()
      requestArray = await summaryPage.captureNetworkRequestsAsArray(
        page,
        httpMethodGet,
        basePage.baseAPIURL + measurementSummaryAPIEndpoint,
      )
    })

    test(`Verify on changing the forecast base time, the measurement summary API is called proportionately`, async ({
      banner,
    }) => {
      await banner.clickOnDay(3)
      await banner.confirmDate()
      expect(requestArray.length).toEqual(9)
    })

    test('Verify on changing the forecast base time, the measurement summary API calls have correct params', async ({
      banner,
    }) => {
      const expectedMeasurementBaseTimeArray = [
        '2024-07-03T12%3A00%3A00.000Z',
        '2024-07-03T15%3A00%3A00.000Z',
        '2024-07-03T18%3A00%3A00.000Z',
        '2024-07-03T21%3A00%3A00.000Z',
        '2024-07-04T00%3A00%3A00.000Z',
        '2024-07-04T03%3A00%3A00.000Z',
        '2024-07-04T06%3A00%3A00.000Z',
        '2024-07-04T09%3A00%3A00.000Z',
        '2024-07-04T12%3A00%3A00.000Z',
        '2024-07-04T15%3A00%3A00.000Z',
        '2024-07-04T18%3A00%3A00.000Z',
        '2024-07-04T21%3A00%3A00.000Z',
        '2024-07-05T00%3A00%3A00.000Z',
        '2024-07-05T03%3A00%3A00.000Z',
        '2024-07-05T06%3A00%3A00.000Z',
        '2024-07-05T09%3A00%3A00.000Z',
        '2024-07-05T12%3A00%3A00.000Z',
        '2024-07-05T15%3A00%3A00.000Z',
        '2024-07-05T18%3A00%3A00.000Z',
        '2024-07-05T21%3A00%3A00.000Z',
        '2024-07-06T00%3A00%3A00.000Z',
        '2024-07-06T03%3A00%3A00.000Z',
        '2024-07-06T06%3A00%3A00.000Z',
        '2024-07-06T09%3A00%3A00.000Z',
        '2024-07-06T12%3A00%3A00.000Z',
        '2024-07-06T15%3A00%3A00.000Z',
        '2024-07-06T18%3A00%3A00.000Z',
        '2024-07-06T21%3A00%3A00.000Z',
        '2024-07-07T00%3A00%3A00.000Z',
        '2024-07-07T03%3A00%3A00.000Z',
        '2024-07-07T06%3A00%3A00.000Z',
        '2024-07-07T09%3A00%3A00.000Z',
        '2024-07-07T12%3A00%3A00.000Z',
        '2024-07-07T15%3A00%3A00.000Z',
        '2024-07-07T18%3A00%3A00.000Z',
        '2024-07-07T21%3A00%3A00.000Z',
        '2024-07-08T00%3A00%3A00.000Z',
        '2024-07-08T03%3A00%3A00.000Z',
        '2024-07-08T06%3A00%3A00.000Z',
        '2024-07-08T09%3A00%3A00.000Z',
        '2024-07-08T12%3A00%3A00.000Z',
      ]
      await banner.clickOnDay(3)
      await banner.confirmDate()
      for (const request in requestArray) {
        expect(requestArray[request]).toContain(
          `measurement_base_time=${expectedMeasurementBaseTimeArray[request]}&measurement_time_range=90&location_type=city`,
        )
      }
    })
  })
})
