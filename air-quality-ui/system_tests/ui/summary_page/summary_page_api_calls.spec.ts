import { expect, test } from '../../utils/fixtures'
import { gotoPage } from '../../utils/helper_methods'

const httpMethodGet: string = 'GET'

test.describe('Using Mocked Data', () => {
  const forecastAPIEndpoint = '/forecast'
  const measurementSummaryAPIEndpoint = '/measurements/summary'

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
        const mockDateTimeNowUriEncoded: string = encodeURIComponent(
          mockSystemDate.toISOString(),
        )

        expect(requestArray[0]).toContain(
          `location_type=city&valid_time_from=${expectedRequestValidTimeFrom}&valid_time_to=${mockDateTimeNowUriEncoded}&base_time=${expectedRequestForecastBaseTime}`,
        )
      })
    })
  })

  test.describe('API calls on page load', () => {
    const systemTime: Date = new Date('2024-06-10T20:00:00Z')

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
      await page.clock.setFixedTime(systemTime)
      await gotoPage(page, 'city/summary')
      await summaryPage.waitForLoad()
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on page load the measurement summary API calls have correct params', async ({
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

    test('Verify on page load the measurement summary API is called proportionately', async ({
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
      expect(requestArray.length).toEqual(15)
    })
  })
})
