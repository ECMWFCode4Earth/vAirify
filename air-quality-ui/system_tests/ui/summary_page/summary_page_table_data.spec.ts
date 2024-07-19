import {
  CaseAQI1,
  CaseAQI2,
  CaseAQI3,
  CaseAQI4,
  CaseAQI5,
  CaseAQI6,
  Colours,
} from '../../utils/enums'
import { expect, test } from '../../utils/fixtures'
import {
  createForecastAPIResponseData,
  createForecastResponseWithValidTimeAndAQI,
  createMeasurementSumResponseWithTimeAndAQI,
  createMeasurementSummaryAPIResponseData,
} from '../../utils/mocked_api'

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
    await summaryPage.assertGridAttributes('values', expectedData)
  })

  test('Check data over several rows is displayed correctly on grid, including +/- diffs', async ({
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
        pm2_5: { aqi_level: 5, value: 52.75 },
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
        pm2_5: { mean: { aqi_level: 4, value: 30.29016575805515 } },
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
        '5', //Forecast
        '4', //Measured
        '+1', // Diff
        //pm2.5
        '52.8', //Forecast
        '30.3', // Measured
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

    await summaryPage.assertGridAttributes('values', expectedData)
  })

  test('(BugFix #191) Verify pollutant level diff 0 does not override a larger diff for calculation of overall AQI level', async ({
    summaryPage,
  }) => {
    // Specific polutant values used to replicate example in bug, however simplified to one valid_time
    const mockedForecastResponse = [
      createForecastAPIResponseData({
        base_time: '2024-07-15T00:00:00Z',
        valid_time: '2024-07-16T09:00:00Z',
        location_type: 'city',
        overall_aqi_level: 3,
        no2: { aqi_level: 1, value: 9.3 },
        o3: { aqi_level: 3, value: 107.2 },
        pm2_5: { aqi_level: 2, value: 12.1 },
        pm10: { aqi_level: 2, value: 23.3 },
        so2: { aqi_level: 1, value: 1.5 },
      }),
    ]
    const measurementSummaryResponse = [
      createMeasurementSummaryAPIResponseData({
        measurement_base_time: '2024-07-16T09:00:00Z',
        overall_aqi_level: { mean: 1 },
        no2: { mean: { aqi_level: 1, value: 25.3 } },
        o3: { mean: { aqi_level: 1, value: 31.4 } },
        pm2_5: { mean: { aqi_level: 1, value: 0 } },
        pm10: { mean: { aqi_level: 1, value: 0 } },
        so2: { mean: { aqi_level: 1, value: 2.5 } },
      }),
    ]

    await summaryPage.setupPageWithMockData(
      mockedForecastResponse,
      measurementSummaryResponse,
    )

    const expectedTableContents: string[][] = [
      [
        // AQI Level
        '3', // Forecast
        '1', // Measured
        '+2', // Diff
      ],
    ]

    await summaryPage.assertGridAttributes('values', expectedTableContents)
  })

  test.describe('Verifying a full row is correct', () => {
    test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 6, measurement AQI 3', async ({
      summaryPage,
    }) => {
      const forecastLondonValidTimeArray: object[] = [
        createForecastResponseWithValidTimeAndAQI('2024-07-08T00:00:00Z', 3),
        createForecastAPIResponseData({
          base_time: '2024-07-08T00:00:00Z',
          valid_time: '2024-07-08T06:00:00Z',
          overall_aqi_level: CaseAQI6.aqiLevel,
          no2: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.no2 },
          o3: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.o3 },
          pm2_5: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.pm2_5 },
          pm10: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.pm10 },
          so2: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.so2 },
        }),
        createForecastResponseWithValidTimeAndAQI('2024-07-08T09:00:00Z', 5),
        createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 4),
      ]

      const measurementsLondonArray: object[] = [
        // AQI 3 measurements
        createMeasurementSumResponseWithTimeAndAQI('2024-07-08T00:00:00Z', 3),
        createMeasurementSummaryAPIResponseData({
          measurement_base_time: '2024-07-08T06:00:00Z',
          overall_aqi_level: { mean: CaseAQI3.aqiLevel },
          no2: {
            mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
          },
          o3: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 } },
          pm2_5: {
            mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
          },
          pm10: {
            mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
          },
          so2: {
            mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
          },
        }),
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
          CaseAQI6.aqiLevel.toString(), // Forecast
          CaseAQI3.aqiLevel.toString(), // Measured
          '+3', // Diff
          // pm2.5
          CaseAQI6.pm2_5.toString(), // Forecast
          CaseAQI3.pm2_5.toString(), // Measured
          '08 Jul 06:00', // Time
          // pm10
          CaseAQI6.pm10.toString(), // Forecast
          CaseAQI3.pm10.toString(), // Measured
          '08 Jul 06:00', // Time
          // no2
          CaseAQI6.no2.toString(), // Forecast
          CaseAQI3.no2.toString(), // Measured
          '08 Jul 06:00', // Time
          // o3
          CaseAQI6.o3.toString(), // Forecast
          CaseAQI3.o3.toString(), // Measured
          '08 Jul 06:00', // Time
          //so2
          CaseAQI6.so2.toString(), // Forecast
          CaseAQI3.so2.toString(), // Measured
          '08 Jul 06:00', // Time
        ],
      ]
      await summaryPage.assertGridAttributes('values', expectedTableContents)
    })

    test('Verify table shows pollutant data for the timestamp that has the largest deviation - forecast AQI 3, measurement AQI 6', async ({
      summaryPage,
    }) => {
      const forecastLondonValidTimeArray: object[] = [
        createForecastAPIResponseData({
          base_time: '2024-07-08T00:00:00Z',
          valid_time: '2024-07-08T09:00:00Z',
          overall_aqi_level: CaseAQI3.aqiLevel,
          no2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
          o3: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
          pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
          pm10: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
          so2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
        }),
        createForecastResponseWithValidTimeAndAQI('2024-07-08T12:00:00Z', 3),
      ]

      const measurementsLondonArray: object[] = [
        createMeasurementSummaryAPIResponseData({
          measurement_base_time: '2024-07-08T09:00:00Z',
          overall_aqi_level: { mean: CaseAQI6.aqiLevel },
          no2: {
            mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.no2 },
          },
          o3: { mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.o3 } },
          pm2_5: {
            mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.pm2_5 },
          },
          pm10: {
            mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.pm10 },
          },
          so2: {
            mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.so2 },
          },
        }),
        createMeasurementSumResponseWithTimeAndAQI('2024-07-08T12:00:00Z', 4),
      ]

      await summaryPage.setupPageWithMockData(
        forecastLondonValidTimeArray,
        measurementsLondonArray,
      )

      const expectedTableContents: string[][] = [
        [
          // AQI Level
          CaseAQI3.aqiLevel.toString(), // Forecast
          CaseAQI6.aqiLevel.toString(), // Measured
          '-3', // Diff
          // pm2.5
          CaseAQI3.pm2_5.toString(), // Forecast
          CaseAQI6.pm2_5.toString(), // Measured
          '08 Jul 09:00', //Time
          // pm10
          CaseAQI3.pm10.toString(), // Forecast
          CaseAQI6.pm10.toString(), // Measured
          '08 Jul 09:00', //Time
          // no2
          CaseAQI3.no2.toString(), // Forecast
          CaseAQI6.no2.toString(), // Measured
          '08 Jul 09:00', //Time
          // o3
          CaseAQI3.o3.toString(), // Forecast
          CaseAQI6.o3.toString(), // Measured
          '08 Jul 09:00', //Time
          // so2
          CaseAQI3.so2.toString(), // Forecast
          CaseAQI6.so2.toString(), // Measured
          '08 Jul 09:00', //Time
        ],
      ]

      await summaryPage.assertGridAttributes('values', expectedTableContents)
    })

    test('Verify table shows pollutant data for the timestamp that has the largest deviation - diff 0 - forecast AQI 3, measurement AQI 3', async ({
      summaryPage,
    }) => {
      const forecastLondonValidTimeArray: object[] = [
        createForecastResponseWithValidTimeAndAQI('2024-07-08T03:00:00Z', 3),
        // AQI 3 default forecast
        createForecastAPIResponseData({
          base_time: '2024-07-08T00:00:00Z',
          valid_time: '2024-07-08T12:00:00Z',
          overall_aqi_level: CaseAQI3.aqiLevel,
          no2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
          o3: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
          pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
          pm10: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
          so2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
        }),
      ]

      const measurementsLondonArray: object[] = [
        createMeasurementSumResponseWithTimeAndAQI('2024-07-08T03:00:00Z', 3),
        // AQI 3 mesurements (higher)
        createMeasurementSummaryAPIResponseData({
          measurement_base_time: '2024-07-08T12:00:00Z',
          overall_aqi_level: { mean: CaseAQI3.aqiLevel },
          no2: { mean: { aqi_level: CaseAQI3.aqiLevel, value: 119 } },
          o3: { mean: { aqi_level: CaseAQI3.aqiLevel, value: 129 } },
          pm2_5: { mean: { aqi_level: CaseAQI3.aqiLevel, value: 24 } },
          pm10: { mean: { aqi_level: CaseAQI3.aqiLevel, value: 49 } },
          so2: { mean: { aqi_level: CaseAQI3.aqiLevel, value: 349 } },
        }),
      ]

      await summaryPage.setupPageWithMockData(
        forecastLondonValidTimeArray,
        measurementsLondonArray,
      )

      const expectedTableContents: string[][] = [
        [
          // AQI Level
          CaseAQI3.aqiLevel.toString(), // Forecast
          CaseAQI3.aqiLevel.toString(), // Measured
          '0', // Diff
          // pm2.5
          CaseAQI3.pm2_5.toString(), // Forecast
          '24', //Measured
          '08 Jul 12:00', //Time
          // pm10
          CaseAQI3.pm10.toString(), // Forecast
          '49', // Measured
          '08 Jul 12:00', //Time
          // no2
          CaseAQI3.no2.toString(), // Forecast
          '119', // Measured
          '08 Jul 12:00', //Time
          // o3
          CaseAQI3.o3.toString(), // Forecast
          '129', // Measured
          '08 Jul 12:00', //Time
          // so2
          CaseAQI3.so2.toString(), // Forecast
          '349', // Measured
          '08 Jul 12:00', //Time
        ],
      ]

      await summaryPage.assertGridAttributes('values', expectedTableContents)
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
      createMeasurementSumResponseWithTimeAndAQI('2024-07-08T12:00:00Z', 6),
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

    await summaryPage.assertGridAttributes('values', expectedTableContents)
  })

  test('Verify if multiple pollutants share the max diff, the AQI values displayed will be the ones with highest overall AQI value', async ({
    summaryPage,
  }) => {
    const forecastLondonValidTimeArray: object[] = [
      createForecastResponseWithValidTimeAndAQI('2024-07-08T03:00:00Z', 1),
    ]

    const measurementsLondonArray: object[] = [
      createMeasurementSummaryAPIResponseData({
        measurement_base_time: '2024-07-08T03:00:00Z',
        overall_aqi_level: { mean: CaseAQI3.aqiLevel },
        no2: { mean: { aqi_level: CaseAQI2.aqiLevel, value: CaseAQI2.no2 } },
        o3: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 } },
        pm2_5: {
          mean: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.pm2_5 },
        },
        pm10: {
          mean: { aqi_level: CaseAQI5.aqiLevel, value: CaseAQI5.pm10 },
        },
        so2: { mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.so2 } },
      }),
    ]

    await summaryPage.setupPageWithMockData(
      forecastLondonValidTimeArray,
      measurementsLondonArray,
    )

    const expectedTableContents: string[][] = [
      [
        // AQI Level
        CaseAQI1.aqiLevel.toString(), // Forecast
        CaseAQI6.aqiLevel.toString(), // Measured
        '-5', // Diff
      ],
    ]

    await summaryPage.assertGridAttributes('values', expectedTableContents)
  })
  test.describe('Colour testing', () => {
    test.beforeEach(async ({ summaryPage }) => {
      await summaryPage.setupPageWithMockData(
        [
          createForecastAPIResponseData({
            valid_time: '2024-07-08T03:00:00Z',
            no2: { aqi_level: CaseAQI1.aqiLevel, value: CaseAQI1.no2 },
            o3: { aqi_level: CaseAQI2.aqiLevel, value: CaseAQI2.o3 },
            pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
            pm10: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.pm10 },
            so2: { aqi_level: CaseAQI1.aqiLevel, value: CaseAQI1.so2 },
          }),
        ],
        [
          createMeasurementSummaryAPIResponseData({
            measurement_base_time: '2024-07-08T03:00:00Z',
            no2: {
              mean: { aqi_level: CaseAQI2.aqiLevel, value: CaseAQI2.no2 },
            },
            o3: {
              mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
            },
            pm2_5: {
              mean: { aqi_level: CaseAQI4.aqiLevel, value: CaseAQI4.pm2_5 },
            },
            pm10: {
              mean: { aqi_level: CaseAQI5.aqiLevel, value: CaseAQI5.pm10 },
            },
            so2: {
              mean: { aqi_level: CaseAQI6.aqiLevel, value: CaseAQI6.so2 },
            },
          }),
        ],
      )
    })
    test('Default Toggle: Highlight all AQI values', async ({
      summaryPage,
    }) => {
      const expectedTableColours: string[][] = [
        [
          // AQI Level
          Colours.aqi1, // Forecast
          Colours.aqi6, //Measured
          Colours.notColoured, // Diff
          // pm2.5
          Colours.aqi3, // Forecast
          Colours.aqi4, //Measured
          Colours.notColoured, //Time
          // pm10
          Colours.aqi4, // Forecast
          Colours.aqi5, // Measured
          Colours.notColoured, //Time
          // no2
          Colours.aqi1, // Forecast
          Colours.aqi2, // Measured
          Colours.notColoured, //Time
          // o3
          Colours.aqi2, // Forecast
          Colours.aqi3, // Measured
          Colours.notColoured, //Time
          // so2
          Colours.aqi1, // Forecast
          Colours.aqi6, // Measured
          Colours.notColoured, //Time
        ],
      ]

      await summaryPage.assertGridAttributes('colours', expectedTableColours)
    })
    test('Click Toggle: Highlight primary AQI values', async ({
      summaryPage,
    }) => {
      const expectedTableColours: string[][] = [
        [
          // AQI Level
          Colours.aqi1, // Forecast
          Colours.aqi6, //Measured
          Colours.notColoured, // Diff
          // pm2.5
          Colours.notColoured, // Forecast
          Colours.notColoured, //Measured
          Colours.notColoured, //Time
          // pm10
          Colours.notColoured, // Forecast
          Colours.notColoured, // Measured
          Colours.notColoured, //Time
          // no2
          Colours.notColoured, // Forecast
          Colours.notColoured, // Measured
          Colours.notColoured, //Time
          // o3
          Colours.notColoured, // Forecast
          Colours.notColoured, // Measured
          Colours.notColoured, //Time
          // so2
          Colours.aqi1, // Forecast
          Colours.aqi6, // Measured
          Colours.notColoured, //Time
        ],
      ]
      await summaryPage.highlightValuesToggle.click()
      await summaryPage.assertGridAttributes('colours', expectedTableColours)
    })
  })
})
