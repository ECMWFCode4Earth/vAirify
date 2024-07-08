import { expect, test } from '../utils/fixtures'

test.describe('BVA - Default to correct forecast base time', () => {
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

    test('Verify on page load the forecast API call has correct base time', async ({
      vairifySummaryPage,
    }) => {
      const expectedRequestForecastBaseTime =
        await vairifySummaryPage.getExpectedRequestForecastBaseTime(
          mockDatetimeNow,
        )
      console.log(expectedRequestForecastBaseTime)
      expect(requestArray[0]).toContain(
        `base_time=${expectedRequestForecastBaseTime}`,
      )
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

    test('Verify on page load the measurement summary API calls have correct measurement base times', async () => {
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
  })
})

test.describe('No Mocking', () => {
  test.beforeEach(async ({ vairifySummaryPage }) => {
    await vairifySummaryPage.goTo()
  })

  test('Verify page title is vAirify', async ({ vairifySummaryPage }) => {
    const title = await vairifySummaryPage.getTitle()
    expect(title).toBe('vAirify')
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

    test('Check data is displayed correctly on grid', async ({
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

    test('Verify that Diff displays the delta between forcast and measured', async ({
      vairifySummaryPage,
    }) => {
      const diffArray = await vairifySummaryPage.calculateForecastDifference()
      expect(diffArray).toEqual([4, 1, 1])
    })
  })
})
