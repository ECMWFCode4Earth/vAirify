import { expect, test } from '../utils/fixtures'

test.beforeEach(async ({ vairifySummaryPage }) => {
  await vairifySummaryPage.setupPage(
    vairifySummaryPage.apiForecast,
    vairifySummaryPage.apiSummary
  )
})

test('Verify page title is vAirify', async ({ vairifySummaryPage }) => {
  const title = await vairifySummaryPage.getTitle()
  expect(title).toBe('vAirify')
})

test.describe('Mocked API tests', () => {
  test('Verify that Headers exist and Innertext matches', async ({
    vairifySummaryPage,
  }) => {
    await vairifySummaryPage.getColumnHeaderAndText('AQI Level', 'AQI Level')
    await vairifySummaryPage.getColumnHeaderAndText(
      'PM 2.5 (µg/m³)',
      'PM 2.5 (µg/m³)'
    )
    await vairifySummaryPage.getColumnHeaderAndText(
      'PM 10 (µg/m³)',
      'PM 10 (µg/m³)'
    )
    await vairifySummaryPage.scrollToRightmostPosition()
    await vairifySummaryPage.page.waitForTimeout(1000)

    await vairifySummaryPage.getColumnHeaderAndText(
      'Nitrogen Dioxide (µg/m³)',
      'Nitrogen Dioxide (µg/m³)'
    )
    await vairifySummaryPage.getColumnHeaderAndText(
      'Ozone (µg/m³)',
      'Ozone (µg/m³)'
    )
    await vairifySummaryPage.getColumnHeaderAndText(
      'Sulphur Dioxide (µg/m³)',
      'Sulphur Dioxide (µg/m³)'
    )
  })

  test('Verify numbers in cells have no more than 1 decimal place ', async ({
    vairifySummaryPage,
  }) => {
    await vairifySummaryPage.checkCellNumberFormat()
  })

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
