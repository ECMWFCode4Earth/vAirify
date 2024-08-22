import { expect, test } from '../../utils/fixtures'
import {
  encodeDateToURIComponent,
  gotoPage,
  setupPageWithMockData,
  waitForIdleNetwork,
} from '../../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../../utils/mocked_api'

const systemDate: Date = new Date('2024-07-18T14:00:00Z')
const forecastAPIEndpoint = '/forecast'
const measurementsAPIEndpoint = '/measurements'
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
      await banner.confirmDate()
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on changing the forecast base time, the forecast API call has correct forecast base time', async ({
      banner,
    }) => {
      const expectedForecastBaseTime: string = await encodeDateToURIComponent(
        new Date(`2024-07-03T12:00:00Z`),
      )

      await banner.clickOnDay(3)
      await banner.confirmDate()
      expect(requestArray[0]).toContain(`base_time=${expectedForecastBaseTime}`)
    })
  })
})

test.describe('Forecast Window', () => {
  let forecastRequestArray: string[]
  let measurementsRequestArray: string[]
  test.beforeEach(async ({ page, cityPage, basePage, banner, summaryPage }) => {
    const mockedForecastResponse = [
      createForecastAPIResponseData({
        base_time: '2024-07-01T00:00:00Z',
        valid_time: '2024-07-01T00:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 1,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-02T00:00:00Z',
        valid_time: '2024-07-01T03:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 2,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-03T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 3,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-04T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 4,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-05T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 5,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-06T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 5,
      }),
    ]

    const mockedMeasurementsCityPageResponse = [
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-02T00:00:00Z',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-03T00:00:00Z',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-04T00:00:00Z',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-05T00:00:00Z',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-06T00:00:00Z',
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
    await gotoPage(page, '/city/Rio%20de%20Janeiro')
    await cityPage.waitForAllGraphsToBeVisible()
    await cityPage.setBaseTime('01/07/2024 00:00')

    forecastRequestArray = await summaryPage.captureNetworkRequestsAsArray(
      page,
      httpMethodGet,
      basePage.baseAPIURL + forecastAPIEndpoint,
    )
    measurementsRequestArray = await summaryPage.captureNetworkRequestsAsArray(
      page,
      httpMethodGet,
      basePage.baseAPIURL + measurementsAPIEndpoint,
    )
    await banner.forecastWindowDropdownClick()
  })
  test.describe('Forecast array', () => {
    const testCases = [
      { window: '1', days: 1, toDate: '2024-07-02T00:00:00Z' },
      { window: '2', days: 2, toDate: '2024-07-03T00:00:00Z' },
      { window: '3', days: 3, toDate: '2024-07-04T00:00:00Z' },
      { window: '4', days: 4, toDate: '2024-07-05T00:00:00Z' },
      { window: '5', days: 5, toDate: '2024-07-06T00:00:00Z' },
    ]

    for (const { window, days, toDate } of testCases) {
      test(`Forecast window ${window} requests ${days} day(s) worth of data`, async ({
        banner,
        page,
        cityPage,
      }) => {
        const expectedValidTimeFrom = await encodeDateToURIComponent(
          new Date('2024-07-01T00:00:00Z'),
        )
        const expectedValidTimeTo = await encodeDateToURIComponent(
          new Date(toDate),
        )

        await banner.forecastWindowDropdownSelect(window)
        await banner.confirmDate()
        await waitForIdleNetwork(page, cityPage.aqiChart)

        await expect(forecastRequestArray[0]).toContain(
          `valid_time_from=${expectedValidTimeFrom}&valid_time_to=${expectedValidTimeTo}`,
        )
      })
    }
  })

  test.describe('Measurements array', () => {
    console.log('Measuremnts will be here')
  })
})
