import { expect, test } from '../utils/fixtures'
import {
  createForecastAPIResponseData,
  createForecastResponseWithValidTimeAndAQI,
  createMeasurementSumResponseWithTimeAndAQI,
  createMeasurementSummaryAPIResponseData,
} from '../utils/mocked_api'

const httpMethodGet: string = 'GET'

test('Verify that Headers exist and Innertext matches', async ({
  summaryPage,
}) => {
  await summaryPage.goTo()
  await summaryPage.getColumnHeaderAndText('AQI Level', 'AQI Level')
  await summaryPage.getColumnHeaderAndText('PM 2.5 (µg/m³)', 'PM 2.5 (µg/m³)')
  await summaryPage.getColumnHeaderAndText('PM 10 (µg/m³)', 'PM 10 (µg/m³)')
  await summaryPage.scrollToRightmostPosition()
  await summaryPage.page.waitForTimeout(1000)

  await summaryPage.getColumnHeaderAndText(
    'Nitrogen Dioxide (µg/m³)',
    'Nitrogen Dioxide (µg/m³)',
  )
  await summaryPage.getColumnHeaderAndText('Ozone (µg/m³)', 'Ozone (µg/m³)')
  await summaryPage.getColumnHeaderAndText(
    'Sulphur Dioxide (µg/m³)',
    'Sulphur Dioxide (µg/m³)',
  )
})

test.describe('Using Mocked Data', () => {
  const forecastAPIEndpoint = '/forecast'
  const measurementSummaryAPIEndpoint = '/measurements/summary'

  test.describe('Forecast base time boundary value analysis using mocked system time', () => {
    ;[
      {
        dateTime: '2024-07-03T10:00:00Z',
        expectedRequestForecastBaseTime: '2024-07-02T00%3A00%3A00.000Z',
        expectedForecastBaseTimePageText: '02 Jul 00:00 UTC',
      },
      {
        dateTime: '2024-07-03T09:59:00Z',
        expectedRequestForecastBaseTime: '2024-07-01T12%3A00%3A00.000Z',
        expectedForecastBaseTimePageText: '01 Jul 12:00 UTC',
      },
      {
        dateTime: '2024-07-03T21:59:00Z',
        expectedRequestForecastBaseTime: '2024-07-02T00%3A00%3A00.000Z',
        expectedForecastBaseTimePageText: '02 Jul 00:00 UTC',
      },
      {
        dateTime: '2024-07-03T22:00:00Z',
        expectedRequestForecastBaseTime: '2024-07-02T12%3A00%3A00.000Z',
        expectedForecastBaseTimePageText: '02 Jul 12:00 UTC',
      },
    ].forEach(
      ({
        dateTime,
        expectedRequestForecastBaseTime,
        expectedForecastBaseTimePageText,
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
          await summaryPage.goTo()

          const expectedRequestValidTimeFrom: string =
            expectedRequestForecastBaseTime
          const mockDateTimeNowUriEncoded: string = encodeURIComponent(
            mockSystemDate.toISOString(),
          )

          expect(requestArray[0]).toContain(
            `location_type=city&valid_time_from=${expectedRequestValidTimeFrom}&valid_time_to=${mockDateTimeNowUriEncoded}&base_time=${expectedRequestForecastBaseTime}`,
          )

          await expect(summaryPage.forecastBaseTimeText).toContainText(
            `Forecast Base Time: ${expectedForecastBaseTimePageText}`,
          )
        })
      },
    )
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
      await summaryPage.goTo()
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
      await summaryPage.goTo()
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
      await summaryPage.goTo()
      expect(requestArray.length).toEqual(15)
    })
  })

  test.describe('Table data validation', () => {
    test('Verify that a city with no in-situ data still show on grid', async ({
      summaryPage,
    }) => {
      const mockedForecastResponse = [
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

      await summaryPage.setupPageWithMockData(mockedForecastResponse)
      const count: number = await summaryPage.textCellSearch('Kyiv')
      const expectedData: string[][] = [
        [
          // AQI Level
          '2', // Forecast
          '-', // Measured
          '-', // Diff
          // pm2.5
          '7', // Forecast
          '-', // Measured
          '24 Jun 09:00', // Time
        ],
      ]

      expect(count).toEqual(1)
      await summaryPage.assertGridValues(expectedData)
    })

    test('Check data over several rows is displayed correctly on grid', async ({
      summaryPage,
    }) => {
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
          overall_aqi_level: 4,
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
      ]

      const mockedMeasurementSummaryResponse = [
        createMeasurementSummaryAPIResponseData({
          measurement_base_time: '2024-06-19T09:00:00Z',
          location_name: 'Kampala',
          overall_aqi_level: { mean: 6 },
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
          overall_aqi_level: { mean: 3 },
          no2: { mean: { aqi_level: 1, value: 1.2220194497781245 } },
          o3: { mean: { aqi_level: 3, value: 110.29793453644987 } },
          pm2_5: { mean: { aqi_level: 2, value: 15.764618078867594 } },
          pm10: { mean: { aqi_level: 2, value: 31.71802172436572 } },
          so2: { mean: { aqi_level: 1, value: 1.3459434727665889 } },
        }),
      ]
      await summaryPage.setupPageWithMockData(
        mockedForecastResponse,
        mockedMeasurementSummaryResponse,
      )
      const expectedData = [
        // Kampala
        [
          // AQI Level
          '2', // Forecast
          '6', // Measured
          '-4', // Diff
          // pm2.5
          '16.1', // Forecast
          '76', // Measured
          '19 Jun 09:00', // Time
        ],
        // Abu Dhabi
        [
          // AQI Level
          '4', //Forecast
          '5', //Measured
          '-1', // Diff
          //pm2.5
          '30.3', //Forecast
          '52.8', // Measured
          '19 Jun 12:00', //Time
        ],
        // Zurich
        [
          // AQI Level
          '2', //Forecast
          '2', //Measured
          '0', // Diff
          //pm2.5
          '17.2', //Forecast
          '15.8', //Measured
          '19 Jun 12:00', //Time
        ],
      ]

      await summaryPage.assertGridValues(expectedData)
    })

    test.describe('Verifying a full row is correct', () => {
      test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 6, measurement AQI 3', async ({
        summaryPage,
      }) => {
        const forecastLondonValidTimeArray: object[] = [
          createForecastResponseWithValidTimeAndAQI('2024-07-08T00:00:00Z', 3),
          createForecastResponseWithValidTimeAndAQI('2024-07-08T06:00:00Z', 6),
          createForecastResponseWithValidTimeAndAQI('2024-07-08T09:00:00Z', 5),
          createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 4),
        ]

        const measurementsLondonArray: object[] = [
          // AQI 3 measurements
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T00:00:00Z', 3),
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T03:00:00Z', 3),
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T06:00:00Z', 3),
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T09:00:00Z', 3),
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T12:00:00Z', 3),
        ]

        await summaryPage.setupPageWithMockData(
          forecastLondonValidTimeArray,
          measurementsLondonArray,
        )

        const expectedTableContents: string[][] = [
          [
            // AQI Level
            '6', // Forecast
            '3', // Measured
            '+3', // Diff
            // pm2.5
            '80', // Forecast
            '22.5', // Measured
            '08 Jul 06:00', // Time
            // pm10
            '160', // Forecast
            '45.5', // Measured
            '08 Jul 06:00', // Time
            // no2
            '900', // Forecast
            '100.5', // Measured
            '08 Jul 06:00', // Time
            // o3
            '400', // Forecast
            '100', // Measured
            '08 Jul 06:00', // Time
            //so2
            '800', // Forecast
            '300.5', // Measured
            '08 Jul 06:00', // Time
          ],
        ]
        await summaryPage.assertGridValues(expectedTableContents)
      })

      test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 3, measurement AQI 6', async ({
        summaryPage,
      }) => {
        const forecastLondonValidTimeArray: object[] = [
          createForecastResponseWithValidTimeAndAQI('2024-07-08T09:00:00Z', 3),
          createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 3),
        ]

        const measurementsLondonArray: object[] = [
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T09:00:00Z', 6),
          createMeasurementSumResponseWithTimeAndAQI(
            '2024-07-08T012:00:00Z',
            4,
          ),
        ]

        await summaryPage.setupPageWithMockData(
          forecastLondonValidTimeArray,
          measurementsLondonArray,
        )

        const expectedTableContents: string[][] = [
          [
            // AQI Level
            '3', // Forecast
            '6', // Measured
            '-3', // Diff
            // pm2.5
            '22.5', // Forecast
            '80', // Measured
            '08 Jul 09:00', //Time
            // pm10
            '45.5', // Forecast
            '160', // Measured
            '08 Jul 09:00', //Time
            // no2
            '100.5', // Forecast
            '900', // Measured
            '08 Jul 09:00', //Time
            // o3
            '100', // Forecast
            '400', // Measured
            '08 Jul 09:00', //Time
            // so2
            '300.5', // Forecast
            '800', // Measured
            '08 Jul 09:00', //Time
          ],
        ]

        await summaryPage.assertGridValues(expectedTableContents)
      })

      test('Verify table shows pollutant data for the timestamp that has the largest deviation - diff 0 - forecast AQI 3, measurement AQI 3', async ({
        summaryPage,
      }) => {
        const forecastLondonValidTimeArray: object[] = [
          // AQI 3 default forecast
          createForecastResponseWithValidTimeAndAQI('2024-07-08T03:00:00Z', 3),
          createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 3),
        ]

        const measurementsLondonArray: object[] = [
          // AQI 3 default measurment
          createMeasurementSumResponseWithTimeAndAQI('2024-07-08T03:00:00Z', 3),
          // AQI 3 mesurements (higher)
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

        await summaryPage.setupPageWithMockData(
          forecastLondonValidTimeArray,
          measurementsLondonArray,
        )

        const expectedTableContents: string[][] = [
          [
            // AQI Level
            '3', // Forecast
            '3', // Measured
            '0', // Diff
            // pm2.5
            '22.5', // Forecast
            '24', //Measured
            '08 Jul 12:00', //Time
            // pm10
            '45.5', // Forecast
            '49', // Measured
            '08 Jul 12:00', //Time
            // no2
            '100.5', // Forecast
            '119', // Measured
            '08 Jul 12:00', //Time
            // o3
            '100', // Forecast
            '129', // Measured
            '08 Jul 12:00', //Time
            // so2
            '300.5', // Forecast
            '349', // Measured
            '08 Jul 12:00', //Time
          ],
        ]

        await summaryPage.assertGridValues(expectedTableContents)
      })
    })
    test('Verify the forecast AQI Level value is the highest overall AQI level in forecast response', async ({
      summaryPage,
    }) => {
      const forecastLondonValidTimeArray: object[] = [
        // AQI 3 default forecast
        createForecastResponseWithValidTimeAndAQI('2024-07-08T03:00:00Z', 3),
        createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 3),
      ]

      const measurementsLondonArray: object[] = [
        // AQI 3 default measurements
        createMeasurementSumResponseWithTimeAndAQI('2024-07-08T03:00:00Z', 3),
        // AQI 3 - Highest pollutant values and AQI
        createMeasurementSummaryAPIResponseData({
          measurement_base_time: '2024-07-08T12:00:00Z',
          overall_aqi_level: { mean: 6 },
          no2: { mean: { aqi_level: 3, value: 119 } },
          o3: { mean: { aqi_level: 3, value: 129 } },
          pm2_5: { mean: { aqi_level: 6, value: 799 } },
          pm10: { mean: { aqi_level: 3, value: 49 } },
          so2: { mean: { aqi_level: 3, value: 349 } },
        }),
      ]

      await summaryPage.setupPageWithMockData(
        forecastLondonValidTimeArray,
        measurementsLondonArray,
      )

      const expectedTableContents: string[][] = [
        [
          // AQI Level
          '3', // Forecast
          '6', // Measured
          '-3', // Diff
        ],
      ]

      await summaryPage.assertGridValues(expectedTableContents)
    })
  })
})
