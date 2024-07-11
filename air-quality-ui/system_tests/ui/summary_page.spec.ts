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
})

test.describe('Forecast base time boundary value analysis using mocked system time', () => {
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
    test(`System time ${dateTime}, assert forecast request params are correct`, async ({
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
      const expectedRequestValidTimeFrom: string =
        expectedRequestForecastBaseTime
      const mockDateTimeNowUriEncoded: string = encodeURIComponent(
        mockSystemDate.toISOString(),
      )

      expect(requestArray[0]).toContain(
        `location_type=city&valid_time_from=${expectedRequestValidTimeFrom}&valid_time_to=${mockDateTimeNowUriEncoded}&base_time=${expectedRequestForecastBaseTime}`,
      )

      await expect(vairifySummaryPage.forecastBaseTimeText).toContainText(
        `Forecast Base Time: ${expectedForecastBaseTime}`,
      )
    })
  })
})

test.describe('API calls on page load', () => {
  const systemTime: Date = new Date('2024-06-10T20:00:00Z')

  test('Verify on page load the forecast API is called once', async ({
    vairifySummaryPage,
    page,
  }) => {
    const requestArray = await vairifySummaryPage.captureNetworkRequestsAsArray(
      page,
      'GET',
      'http://localhost:8000/air-pollutant/forecast',
    )
    await page.clock.setFixedTime(systemTime)
    await vairifySummaryPage.goTo()
    expect(requestArray.length).toEqual(1)
  })

  test('Verify on page load the measurement summary API calls have correct params', async ({
    vairifySummaryPage,
    page,
  }) => {
    const requestArray = await vairifySummaryPage.captureNetworkRequestsAsArray(
      page,
      'GET',
      'http://localhost:8000/air-pollutant/measurements/summary',
    )
    await page.clock.setFixedTime(systemTime)
    await vairifySummaryPage.goTo()
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
    vairifySummaryPage,
    page,
  }) => {
    const requestArray = await vairifySummaryPage.captureNetworkRequestsAsArray(
      page,
      'GET',
      'http://localhost:8000/air-pollutant/measurements/summary',
    )
    await page.clock.setFixedTime(systemTime)
    await vairifySummaryPage.goTo()
    const expectedNumberofRequests =
      await vairifySummaryPage.calculateExpectedVolumeOfRequests(systemTime)
    expect(requestArray.length).toEqual(expectedNumberofRequests)
  })
})

test.describe('Mocked API Response Tests', () => {
  test.beforeEach(async ({ vairifySummaryPage }) => {
    const mockedForecastResponse = [
      createForecastAPIResponseData({
        base_time: '2024-06-19T00:00:00Z',
        valid_time: '2024-06-19T09:00:00Z',
        location_type: 'city',
        location_name: 'Kampala',
        overall_aqi_level: 2,
        no2: { aqi_level: 1, value: 0.3812829140487199 },
        o3: { aqi_level: 2, value: 72.9086035913633 },
        pm2_5: { aqi_level: 2, value: 16.067128848211063 },
        pm10: { aqi_level: 2, value: 26.087666551144732 },
        so2: { aqi_level: 1, value: 0.6314619719025142 },
      }),
      createForecastAPIResponseData({
        base_time: '2024-06-19T00:00:00Z',
        valid_time: '2024-06-19T12:00:00Z',
        location_type: 'city',
        location_name: 'Abu Dhabi',
        overall_aqi_level: 3,
        no2: { aqi_level: 1, value: 5.871611751344455 },
        o3: { aqi_level: 4, value: 213.04088459925424 },
        pm2_5: { aqi_level: 4, value: 30.29016575805515 },
        pm10: { aqi_level: 4, value: 58.25755291558235 },
        so2: { aqi_level: 1, value: 8.497931484924965 },
      }),
      createForecastAPIResponseData({
        base_time: '2024-06-19T00:00:00Z',
        valid_time: '2024-06-19T12:00:00Z',
        location_type: 'city',
        location_name: 'Zurich',
        overall_aqi_level: 3,
        no2: { aqi_level: 1, value: 1.2220194497781245 },
        o3: { aqi_level: 3, value: 110.29793453644987 },
        pm2_5: { aqi_level: 2, value: 17.161946368293673 },
        pm10: { aqi_level: 2, value: 31.71802172436572 },
        so2: { aqi_level: 1, value: 1.3459434727665889 },
      }),
      createForecastAPIResponseData({
        base_time: '2024-06-24T00:00:00Z',
        valid_time: '2024-06-24T09:00:00Z',
        location_type: 'city',
        location_name: 'Kyiv',
        overall_aqi_level: 2,
        no2: { aqi_level: 1, value: 0.7852695955767444 },
        o3: { aqi_level: 2, value: 80.0214446372413 },
        pm2_5: { aqi_level: 1, value: 7.024702103355023 },
        pm10: { aqi_level: 1, value: 10.313057730041718 },
        so2: { aqi_level: 1, value: 0.465807542763243 },
      }),
    ]

    const mockedMeasurementSummaryResponse = [
      createMeasurementSummaryAPIResponseData({
        measurement_base_time: '2024-06-19T09:00:00Z',
        location_name: 'Kampala',
        overall_aqi_level: { mean: 2 },
        no2: { mean: { aqi_level: 1, value: 0.3812829140487199 } },
        o3: { mean: { aqi_level: 2, value: 72.9086035913633 } },
        pm2_5: { mean: { aqi_level: 6, value: 76 } },
        pm10: { mean: { aqi_level: 2, value: 26.087666551144732 } },
        so2: { mean: { aqi_level: 1, value: 0.6314619719025142 } },
      }),
      createMeasurementSummaryAPIResponseData({
        measurement_base_time: '2024-06-19T12:00:00Z',
        location_name: 'Abu Dhabi',
        overall_aqi_level: { mean: 5 },
        no2: { mean: { aqi_level: 1, value: 5.871611751344455 } },
        o3: { mean: { aqi_level: 4, value: 213.04088459925424 } },
        pm2_5: { mean: { aqi_level: 5, value: 52.75 } },
        pm10: { mean: { aqi_level: 4, value: 58.25755291558235 } },
        so2: { mean: { aqi_level: 1, value: 8.497931484924965 } },
      }),
      createMeasurementSummaryAPIResponseData({
        measurement_base_time: '2024-06-19T12:00:00Z',
        location_name: 'Zurich',
        overall_aqi_level: { mean: 2 },
        no2: { mean: { aqi_level: 1, value: 1.2220194497781245 } },
        o3: { mean: { aqi_level: 3, value: 110.29793453644987 } },
        pm2_5: { mean: { aqi_level: 2, value: 15.764618078867594 } },
        pm10: { mean: { aqi_level: 2, value: 31.71802172436572 } },
        so2: { mean: { aqi_level: 1, value: 1.3459434727665889 } },
      }),
    ]
    await vairifySummaryPage.setupPageWithMockData(
      mockedForecastResponse,
      mockedMeasurementSummaryResponse,
    )
  })

  test.describe('Table Data Validation', () => {
    test('Verify that a city with no in-situ data still show on grid', async ({
      vairifySummaryPage,
    }) => {
      const count = await vairifySummaryPage.textCellSearch('Kyiv')
      expect(count).toEqual(1)
    })

    test('Check data is displayed correctly on grid', async ({
      vairifySummaryPage,
    }) => {
      // first 6 values for Kampala, Abu Dhabi, Zurich and Kyiv respectively
      const expectedData = [
        ['2', '6', '-4', '16.1', '76', '19 Jun 09:00'],
        ['4', '5', '-1', '30.3', '52.8', '19 Jun 12:00'],
        ['2', '2', '0', '17.2', '15.8', '19 Jun 12:00'],
        ['2', '-', '-', '7', '-', '24 Jun 09:00'],
      ]

      await vairifySummaryPage.assertGridValues(expectedData)
    })

    test.describe('Table Data: Largest Deviation', () => {
      test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 6, measurement AQI 3', async ({
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
        await vairifySummaryPage.assertGridValues(expectedTableContents)
      })

      test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 3, measurement AQI 6', async ({
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

        await vairifySummaryPage.assertGridValues(expectedTableContents)
      })

      test('Verify table shows pollutant data for the timestamp that has the largest deviation - diff 0 - forecast AQI 3, measurement AQI 3', async ({
        vairifySummaryPage,
      }) => {
        const forecastLondonValidTimeArray: object[] = [
          createForecastAPIResponseData(),
          createForecastAPIResponseData({
            valid_time: '2024-07-08T03:00:00Z',
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
            measurement_base_time: '2024-07-08T12:00:00Z',
            overall_aqi_level: { mean: 3 },
            no2: { mean: { aqi_level: 3, value: 119 } },
            o3: { mean: { aqi_level: 3, value: 129 } },
            pm2_5: { mean: { aqi_level: 3, value: 24 } },
            pm10: { mean: { aqi_level: 3, value: 49 } },
            so2: { mean: { aqi_level: 3, value: 349 } },
          }),
        ]

        await vairifySummaryPage.setupPageWithMockData(
          forecastLondonValidTimeArray,
          measurementsLondonArray,
        )

        const expectedTableContents: string[][] = [
          [
            '3',
            '3',
            '0',
            '22.5',
            '24',
            '08 Jul 12:00',
            '45.5',
            '49',
            '08 Jul 12:00',
            '100.5',
            '119',
            '08 Jul 12:00',
            '100.5',
            '129',
            '08 Jul 12:00',
            '300.5',
            '349',
            '08 Jul 12:00',
          ],
        ]

        await vairifySummaryPage.assertGridValues(expectedTableContents)
      })

      test('Verify the forecast AQI Level value is the highest overall AQI level in forecast response', async ({
        vairifySummaryPage,
      }) => {
        const forecastLondonValidTimeArray: object[] = [
          createForecastAPIResponseData(),
          createForecastAPIResponseData({
            valid_time: '2024-07-08T03:00:00Z',
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
            measurement_base_time: '2024-07-08T12:00:00Z',
            overall_aqi_level: { mean: 3 },
            no2: { mean: { aqi_level: 3, value: 119 } },
            o3: { mean: { aqi_level: 3, value: 129 } },
            pm2_5: { mean: { aqi_level: 6, value: 799 } },
            pm10: { mean: { aqi_level: 3, value: 49 } },
            so2: { mean: { aqi_level: 3, value: 349 } },
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
            '799',
            '08 Jul 12:00',
            '45.5',
            '49',
            '08 Jul 12:00',
            '100.5',
            '119',
            '08 Jul 12:00',
            '100.5',
            '129',
            '08 Jul 12:00',
            '300.5',
            '349',
            '08 Jul 12:00',
          ],
        ]

        await vairifySummaryPage.assertGridValues(expectedTableContents)
      })
    })
  })
})
