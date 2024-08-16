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

test.describe('Forecast window', () => {
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

  test('Forecast window 1 requests 1 day worth of data', async ({
    banner,
    page,
    cityPage,
  }) => {
    const expectedValidTimeFrom: string = await encodeDateToURIComponent(
      new Date(`2024-07-01T00:00:00Z`),
    )
    const expectedValidTimeTo: string = await encodeDateToURIComponent(
      new Date(`2024-07-02T00:00:00Z`),
    )

    await banner.forecastWindowDropdownSelect('1')
    await banner.confirmDate()
    await waitForIdleNetwork(page, cityPage.aqiChart)

    await expect(forecastRequestArray[1]).toContain(
      `valid_time_from=${expectedValidTimeFrom}`,
    )
    await expect(forecastRequestArray[1]).toContain(
      `valid_time_to=${expectedValidTimeTo}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_from=${expectedValidTimeFrom}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_to=${expectedValidTimeTo}`,
    )
  })
  test('Forecast window 2 requests 2 days worth of data', async ({
    banner,
    page,
    cityPage,
  }) => {
    const expectedValidTimeFrom: string = await encodeDateToURIComponent(
      new Date(`2024-07-01T00:00:00Z`),
    )
    const expectedValidTimeTo: string = await encodeDateToURIComponent(
      new Date(`2024-07-03T00:00:00Z`),
    )

    await banner.forecastWindowDropdownSelect('2')
    await banner.confirmDate()
    await waitForIdleNetwork(page, cityPage.aqiChart)

    await expect(forecastRequestArray[1]).toContain(
      `valid_time_from=${expectedValidTimeFrom}`,
    )
    await expect(forecastRequestArray[1]).toContain(
      `valid_time_to=${expectedValidTimeTo}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_from=${expectedValidTimeFrom}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_to=${expectedValidTimeTo}`,
    )
  })
  test('Forecast window 3 requests 3 days worth of data', async ({
    banner,
    page,
    cityPage,
  }) => {
    const expectedValidTimeFrom: string = await encodeDateToURIComponent(
      new Date(`2024-07-01T00:00:00Z`),
    )
    const expectedValidTimeTo: string = await encodeDateToURIComponent(
      new Date(`2024-07-04T00:00:00Z`),
    )

    await banner.forecastWindowDropdownSelect('3')
    await banner.confirmDate()
    await waitForIdleNetwork(page, cityPage.aqiChart)

    await expect(forecastRequestArray[1]).toContain(
      `valid_time_from=${expectedValidTimeFrom}`,
    )
    await expect(forecastRequestArray[1]).toContain(
      `valid_time_to=${expectedValidTimeTo}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_from=${expectedValidTimeFrom}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_to=${expectedValidTimeTo}`,
    )
  })
  test('Forecast window 4 requests 4 days worth of data', async ({
    banner,
    page,
    cityPage,
  }) => {
    const expectedValidTimeFrom: string = await encodeDateToURIComponent(
      new Date(`2024-07-01T00:00:00Z`),
    )
    const expectedValidTimeTo: string = await encodeDateToURIComponent(
      new Date(`2024-07-05T00:00:00Z`),
    )

    await banner.forecastWindowDropdownSelect('4')
    await banner.confirmDate()
    await waitForIdleNetwork(page, cityPage.aqiChart)

    await expect(forecastRequestArray[1]).toContain(
      `valid_time_from=${expectedValidTimeFrom}`,
    )
    await expect(forecastRequestArray[1]).toContain(
      `valid_time_to=${expectedValidTimeTo}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_from=${expectedValidTimeFrom}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_to=${expectedValidTimeTo}`,
    )
  })
  test('Forecast window 5 requests 5 days worth of data', async ({
    banner,
    page,
    cityPage,
  }) => {
    const expectedValidTimeFrom: string = await encodeDateToURIComponent(
      new Date(`2024-07-01T00:00:00Z`),
    )
    const expectedValidTimeTo: string = await encodeDateToURIComponent(
      new Date(`2024-07-06T00:00:00Z`),
    )

    await banner.forecastWindowDropdownSelect('5')
    await banner.confirmDate()
    await waitForIdleNetwork(page, cityPage.aqiChart)

    await expect(forecastRequestArray[1]).toContain(
      `valid_time_from=${expectedValidTimeFrom}`,
    )
    await expect(forecastRequestArray[1]).toContain(
      `valid_time_to=${expectedValidTimeTo}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_from=${expectedValidTimeFrom}`,
    )
    await expect(measurementsRequestArray[1]).toContain(
      `date_to=${expectedValidTimeTo}`,
    )
  })
})
