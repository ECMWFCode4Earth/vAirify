import { expect, test } from '../utils/fixtures'
import {
  createForecastAPIResponseData,
  createMeasurementSummaryAPIResponseData,
} from '../utils/mocked_api'

test.describe('No Mocking', () => {
  test.beforeEach(async ({ vairifySummaryPage }) => {
    await vairifySummaryPage.goTo()
  })

  test('Verify page title is vAirify', async ({ vairifySummaryPage }) => {
    const title = await vairifySummaryPage.getTitle()
    expect(title).toBe('vAirify')
  })
})

test.describe('BVA using mocked system time', () => {
  ;[
    {
      dateTime: '2024-07-03T10:00:00Z',
      expectedForecastBaseTime: '02 Jul 00:00 UTC',
    },
    {
      dateTime: '2024-07-03T09:59:00Z',
      expectedForecastBaseTime: '01 Jul 12:00 UTC',
    },
    {
      dateTime: '2024-07-03T21:59:00Z',
      expectedForecastBaseTime: '02 Jul 00:00 UTC',
    },
    {
      dateTime: '2024-07-03T22:00:00Z',
      expectedForecastBaseTime: '02 Jul 12:00 UTC',
    },
  ].forEach(({ dateTime, expectedForecastBaseTime }) => {
    test(`System time ${dateTime}, assert forecast base time ${expectedForecastBaseTime}`, async ({
      page,
      vairifySummaryPage,
    }) => {
      const mockSystemDate: Date = new Date(dateTime)
      await page.clock.setFixedTime(mockSystemDate)

      const requestArray: string[] =
        await vairifySummaryPage.captureNetworkRequestsAsArray(
          page,
          'GET',
          'http://localhost:8000/air-pollutant/forecast',
        )
      await vairifySummaryPage.goTo()

      const expectedRequestForecastBaseTime =
        await vairifySummaryPage.getExpectedRequestForecastBaseTime(
          mockSystemDate,
        )
      expect(requestArray[0]).toContain(
        `base_time=${expectedRequestForecastBaseTime}`,
      )
      await expect(vairifySummaryPage.forecastBaseTimeText).toContainText(
        `Forecast Base Time: ${expectedForecastBaseTime}`,
      )
    })
  })
})

test.describe('On page load', () => {
  const mockDatetimeNow: Date = new Date('2024-06-10T20:00:00Z')

  test.describe('forecast endpoint', () => {
    let requestArray: string[]
    test.beforeEach(async ({ page, vairifySummaryPage }) => {
      requestArray = await vairifySummaryPage.captureNetworkRequestsAsArray(
        page,
        'GET',
        'http://localhost:8000/air-pollutant/forecast',
      )
      await page.clock.setFixedTime(mockDatetimeNow)
      await vairifySummaryPage.goTo()
    })
    test('Verify on page load the forecast API is called once', async () => {
      expect(requestArray.length).toEqual(1)
    })

    test('Verify on page load the forecast API call has correct base_time', async ({
      vairifySummaryPage,
    }) => {
      const expectedRequestForecastBaseTime: string =
        await vairifySummaryPage.getExpectedRequestForecastBaseTime(
          mockDatetimeNow,
        )
      expect(requestArray[0]).toContain(
        `base_time=${expectedRequestForecastBaseTime}`,
      )
    })

    test('Verify on page load the forecast API call has valid_time_from set to the base_time', async ({
      vairifySummaryPage,
    }) => {
      const expectedRequestForecastBaseTime: string =
        await vairifySummaryPage.getExpectedRequestForecastBaseTime(
          mockDatetimeNow,
        )
      const expectedRequestValidTimeFrom: string =
        expectedRequestForecastBaseTime
      expect(requestArray[0]).toContain(
        `valid_time_from=${expectedRequestValidTimeFrom}`,
      )
    })

    test('Verify on page load the forecast API call has valid_time_to set to current time', async () => {
      const mockDateTimeNowUriEncoded: string = encodeURIComponent(
        mockDatetimeNow.toISOString(),
      )
      expect(requestArray[0]).toContain(
        `valid_time_to=${mockDateTimeNowUriEncoded}`,
      )
    })

    test('Verify on page load the forecast API call has location_type city', async () => {
      expect(requestArray[0]).toContain('location_type=city')
    })
  })

  test.describe('measurements/summary endpoint', () => {
    let requestArray: string[]

    test.beforeEach(async ({ page, vairifySummaryPage }) => {
      requestArray = await vairifySummaryPage.captureNetworkRequestsAsArray(
        page,
        'GET',
        'http://localhost:8000/air-pollutant/measurements/summary',
      )
      await page.clock.setFixedTime(mockDatetimeNow)
      await vairifySummaryPage.goTo()
    })

    test('Verify on page load the measurement summary API is called proportionately', async ({
      vairifySummaryPage,
    }) => {
      const expectedNumberofRequests =
        await vairifySummaryPage.calculateExpectedVolumeofRequests(
          mockDatetimeNow,
        )
      expect(requestArray.length).toEqual(expectedNumberofRequests)
    })

    test('Verify on page load the measurement summary API calls have correct measurement_base_times', async () => {
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
          `measurement_base_time=${expectedMeasurementBaseTimeArray[request]}`,
        )
      }
    })

    test('Verify on page load the measurement summary API calls have measurement_time_range of 90', async () => {
      for (const request in requestArray) {
        expect(requestArray[request]).toContain('measurement_time_range=91')
      }
    })

    test('Verify on page load the measurement summary API calls have location_type city', async () => {
      for (const request in requestArray) {
        expect(requestArray[request]).toContain('location_type=city')
      }
    })
  })
})

test.describe('Mocked API Response Tests', () => {
  test.beforeEach(async ({ vairifySummaryPage }) => {
    await vairifySummaryPage.setupPageWithMockData(
      vairifySummaryPage.mockedForecastResponse,
      vairifySummaryPage.mockedMeasurementSummaryResponse,
    )
  })
  test.describe('Table Structure', () => {
    test('Verify that Headers exist and Innertext matches', async ({
      vairifySummaryPage,
    }) => {
      await vairifySummaryPage.getColumnHeaderAndText('AQI Level', 'AQI Level')
      await vairifySummaryPage.getColumnHeaderAndText(
        'PM 2.5 (µg/m³)',
        'PM 2.5 (µg/m³)',
      )
      await vairifySummaryPage.getColumnHeaderAndText(
        'PM 10 (µg/m³)',
        'PM 10 (µg/m³)',
      )
      await vairifySummaryPage.scrollToRightmostPosition()
      await vairifySummaryPage.page.waitForTimeout(1000)

      await vairifySummaryPage.getColumnHeaderAndText(
        'Nitrogen Dioxide (µg/m³)',
        'Nitrogen Dioxide (µg/m³)',
      )
      await vairifySummaryPage.getColumnHeaderAndText(
        'Ozone (µg/m³)',
        'Ozone (µg/m³)',
      )
      await vairifySummaryPage.getColumnHeaderAndText(
        'Sulphur Dioxide (µg/m³)',
        'Sulphur Dioxide (µg/m³)',
      )
    })

    test('Verify numbers in cells have no more than 1 decimal place ', async ({
      vairifySummaryPage,
    }) => {
      await vairifySummaryPage.checkCellNumberFormat()
    })
  })

  test.describe('Table Data Validation', () => {
    test('Verify that a city with no in-situ data still show on grid', async ({
      vairifySummaryPage,
    }) => {
      const count = await vairifySummaryPage.textCellSearch('Kyiv')
      expect(count).toEqual(1)
    })

    // skipped, WIP
    test.skip('Check data is displayed correctly on grid', async ({
      vairifySummaryPage,
    }) => {
      // first 6 values for Kampala, Abu Dhabi, Zurich and Kyiv respectively
      const expectedData = [
        ['2', '6', '4', '16.1', '76', '19 Jun 09:00'],
        ['4', '5', '1', '30.3', '52.8', '19 Jun 12:00'],
        ['2', '1', '1', '17.2', '15.8', '19 Jun 12:00'],
        ['2', '', '', '7', '', '24 Jun 09:00'],
      ]

      await vairifySummaryPage.assertGridValues(expectedData)
    })

    // skipped, WIP
    test.skip('Verify that Diff displays the delta between forcast and measured', async ({
      vairifySummaryPage,
    }) => {
      const diffArray = await vairifySummaryPage.calculateForecastDifference()
      expect(diffArray).toEqual([4, 1, 1])
    })
  })
})

test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast higher', async ({
  page,
  vairifySummaryPage,
}) => {
  const forecastLondonValidTimeArray: object[] = [
    createForecastAPIResponseData(),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T03:00:00Z',
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T06:00:00Z',
      overall_aqi_level: 6,
      no2: { aqi_level: 6, value: 900 },
      o3: { aqi_level: 6, value: 400 },
      pm2_5: { aqi_level: 6, value: 80 },
      pm10: { aqi_level: 6, value: 160 },
      so2: { aqi_level: 6, value: 800 },
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T09:00:00Z',
      overall_aqi_level: 5,
      no2: { aqi_level: 5, value: 240 },
      o3: { aqi_level: 5, value: 370 },
      pm2_5: { aqi_level: 5, value: 60 },
      pm10: { aqi_level: 5, value: 120 },
      so2: { aqi_level: 5, value: 510 },
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T12:00:00Z',
      overall_aqi_level: 4,
      no2: { aqi_level: 4, value: 125 },
      o3: { aqi_level: 4, value: 135 },
      pm2_5: { aqi_level: 4, value: 26 },
      pm10: { aqi_level: 4, value: 99 },
      so2: { aqi_level: 4, value: 205 },
    }),
  ]

  const measurementsLondonArray: object[] = [
    createMeasurementSummaryAPIResponseData(),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T03:00:00Z',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T06:00:00Z',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T09:00:00Z',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T012:00:00Z',
    }),
  ]

  await vairifySummaryPage.setupPageWithMockData(
    forecastLondonValidTimeArray,
    measurementsLondonArray,
  )

  const expectedTableContents: string[][] = [
    [
      '6',
      '3',
      '+3',
      '80',
      '22.5',
      '08 Jul 06:00',
      '160',
      '45.5',
      '08 Jul 06:00',
      '900',
      '100.5',
      '08 Jul 06:00',
      '400',
      '100.5',
      '08 Jul 06:00',
      '800',
      '300.5',
      '08 Jul 06:00',
    ],
  ]

  let i = 0
  while (i < expectedTableContents[0].length) {
    const targetCell = page.locator(
      `//div[ @aria-rowindex='3'] //div[@aria-colindex='${i + 2}']`,
    )
    await targetCell.scrollIntoViewIfNeeded()
    await expect(targetCell).toContainText(expectedTableContents[0][i])
    i++
  }
})

test('Verify table shows pollutant data for the timestamp that has the largest deviation - measurements higher', async ({
  page,
  vairifySummaryPage,
}) => {
  const forecastLondonValidTimeArray: object[] = [
    createForecastAPIResponseData(),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T03:00:00Z',
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T06:00:00Z',
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T09:00:00Z',
    }),
    createForecastAPIResponseData({
      valid_time: '2024-07-08T12:00:00Z',
    }),
  ]

  const measurementsLondonArray: object[] = [
    createMeasurementSummaryAPIResponseData(),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T03:00:00Z',
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T06:00:00Z',
      overall_aqi_level: { mean: 5 },
      no2: { mean: { aqi_level: 5, value: 240 } },
      o3: { mean: { aqi_level: 5, value: 370 } },
      pm2_5: { mean: { aqi_level: 5, value: 60 } },
      pm10: { mean: { aqi_level: 5, value: 120 } },
      so2: { mean: { aqi_level: 5, value: 510 } },
    }),
    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T09:00:00Z',
      overall_aqi_level: { mean: 6 },
      no2: { mean: { aqi_level: 6, value: 900 } },
      o3: { mean: { aqi_level: 6, value: 400 } },
      pm2_5: { mean: { aqi_level: 6, value: 80 } },
      pm10: { mean: { aqi_level: 6, value: 160 } },
      so2: { mean: { aqi_level: 6, value: 800 } },
    }),

    createMeasurementSummaryAPIResponseData({
      measurement_base_time: '2024-07-08T012:00:00Z',
      overall_aqi_level: { mean: 4 },
      no2: { mean: { aqi_level: 4, value: 125 } },
      o3: { mean: { aqi_level: 4, value: 135 } },
      pm2_5: { mean: { aqi_level: 4, value: 26 } },
      pm10: { mean: { aqi_level: 4, value: 99 } },
      so2: { mean: { aqi_level: 4, value: 205 } },
    }),
  ]

  await vairifySummaryPage.setupPageWithMockData(
    forecastLondonValidTimeArray,
    measurementsLondonArray,
  )

  const expectedTableContents: string[][] = [
    [
      '3',
      '6',
      '-3',
      '22.5',
      '80',
      '08 Jul 09:00',
      '45.5',
      '160',
      '08 Jul 09:00',
      '100.5',
      '900',
      '08 Jul 09:00',
      '100.5',
      '400',
      '08 Jul 09:00',
      '300.5',
      '800',
      '08 Jul 09:00',
    ],
  ]

  let i = 0
  while (i < expectedTableContents[0].length) {
    const targetCell = page.locator(
      `//div[ @aria-rowindex='3'] //div[@aria-colindex='${i + 2}']`,
    )
    await targetCell.scrollIntoViewIfNeeded()
    await expect(targetCell).toContainText(expectedTableContents[0][i])
    i++
  }
})
