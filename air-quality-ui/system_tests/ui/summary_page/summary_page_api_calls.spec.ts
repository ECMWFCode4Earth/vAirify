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
          expectedValidTimeTo: '2024-07-03T00%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T09:59:00Z',
          expectedRequestForecastBaseTime: '2024-07-01T12%3A00%3A00.000Z',
          expectedValidTimeTo: '2024-07-02T12%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T21:59:00Z',
          expectedRequestForecastBaseTime: '2024-07-02T00%3A00%3A00.000Z',
          expectedValidTimeTo: '2024-07-03T00%3A00%3A00.000Z',
        },
        {
          dateTime: '2024-07-03T22:00:00Z',
          expectedRequestForecastBaseTime: '2024-07-02T12%3A00%3A00.000Z',
          expectedValidTimeTo: '2024-07-03T12%3A00%3A00.000Z',
        },
      ].forEach(
        ({
          dateTime,
          expectedRequestForecastBaseTime,
          expectedValidTimeTo,
        }) => {
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
            const expectedRequestValidTimeTo: string = expectedValidTimeTo
            expect(requestArray[0]).toContain(
              `location_type=city&valid_time_from=${expectedRequestValidTimeFrom}&valid_time_to=${expectedRequestValidTimeTo}&base_time=${expectedRequestForecastBaseTime}`,
            )
          })
        },
      )
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
      await banner.clickUpdateButton()
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on changing the forecast base time, the forecast API call has correct params', async ({
      banner,
    }) => {
      const expectedForecastBaseTime: string = await encodeDateToURIComponent(
        new Date(`2024-07-03T12:00:00Z`),
      )
      const expectedValidTimeFrom: string = expectedForecastBaseTime
      const expectedValidTimeTo = await encodeDateToURIComponent(
        new Date('2024-07-04T12:00:00Z'),
      )
      await banner.clickOnDay(3)
      await banner.clickUpdateButton()
      expect(requestArray[0]).toContain(
        `location_type=city&valid_time_from=${expectedValidTimeFrom}&valid_time_to=${expectedValidTimeTo}&base_time=${expectedForecastBaseTime}`,
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
      await banner.clickOnDay(3)
    })

    test.describe('Forecast window selections', () => {
      const testCases = [
        { windowOption: '1', requestCount: 9 },
        { windowOption: '2', requestCount: 17 },
        { windowOption: '3', requestCount: 25 },
        { windowOption: '4', requestCount: 33 },
        { windowOption: '5', requestCount: 41 },
      ]

      for (const { windowOption, requestCount } of testCases)
        test(`When forecast window is ${windowOption} then ${requestCount} requests should be made `, async ({
          banner,
        }) => {
          await banner.setForecastWindow(windowOption)
          await banner.clickUpdateButton()
          await expect(requestArray.length).toEqual(requestCount)
        })
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
      await banner.clickUpdateButton()
      for (const request in requestArray) {
        expect(requestArray[request]).toContain(
          `measurement_base_time=${expectedMeasurementBaseTimeArray[request]}&measurement_time_range=90&location_type=city`,
        )
      }
    })
  })
})

test.describe('Forecast window for summary page', () => {
  let forecastRequestArray: string[]
  test.beforeEach(async ({ page, basePage, banner, summaryPage }) => {
    await gotoPage(page, 'city/summary')
    await banner.setBaseTime('01/07/2024 00:00')

    forecastRequestArray = await summaryPage.captureNetworkRequestsAsArray(
      page,
      httpMethodGet,
      basePage.baseAPIURL + forecastAPIEndpoint,
    )
  })
  const testCases = [
    { windowOption: '1', days: 1, toDate: '2024-07-02T00:00:00Z' },
    { windowOption: '2', days: 2, toDate: '2024-07-03T00:00:00Z' },
    { windowOption: '3', days: 3, toDate: '2024-07-04T00:00:00Z' },
    { windowOption: '4', days: 4, toDate: '2024-07-05T00:00:00Z' },
    { windowOption: '5', days: 5, toDate: '2024-07-06T00:00:00Z' },
  ]
  test.describe('Forecast API array', () => {
    for (const { windowOption, days, toDate } of testCases) {
      test(`Forecast window ${windowOption} requests ${days} day(s) worth of data`, async ({
        banner,
      }) => {
        const expectedValidTimeFrom = await encodeDateToURIComponent(
          new Date('2024-07-01T00:00:00Z'),
        )
        const expectedValidTimeTo = await encodeDateToURIComponent(
          new Date(toDate),
        )

        await banner.setForecastWindow(windowOption)
        await banner.clickUpdateButton()
        await expect(forecastRequestArray[0]).toContain(
          `location_type=city&valid_time_from=${expectedValidTimeFrom}&valid_time_to=${expectedValidTimeTo}&base_time=2024-07-01T00%3A00%3A00.000Z`,
        )
      })
    }
  })
})
