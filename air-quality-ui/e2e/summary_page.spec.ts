import { expect, test } from '@playwright/test'

import { apiForecast, apiSummary } from './mocked_api.ts'
import { VairifySummaryPage } from './vAirify_summary_page.ts'

async function setupVairifySummaryPage(page) {
  const vairifySummaryPage = new VairifySummaryPage(
    page,
    apiForecast,
    apiSummary,
  )
  await vairifySummaryPage.setupApiRoutes()
  await vairifySummaryPage.gotoSummaryPage()
  await vairifySummaryPage.waitForGridVisible()
  return vairifySummaryPage
}

test.describe('Mocked API tests', () => {
  test('Verify page title is vAirify', async ({ page }) => {
    await setupVairifySummaryPage(page)
    const title = await page.title()
    expect(title).toBe('vAirify')
  })

  test('Verify that headers are visible and have matching text', async ({
    page,
  }) => {
    const vairifySummaryPage = await setupVairifySummaryPage(page)
    await vairifySummaryPage.checkColumnHeaderText('AQI Level', 'AQI Level')
    await vairifySummaryPage.checkColumnHeaderText(
      'PM 2.5 (µg/m³)',
      'PM 2.5 (µg/m³)',
    )
    await vairifySummaryPage.checkColumnHeaderText(
      'PM 10 (µg/m³)',
      'PM 10 (µg/m³)',
    )
    await vairifySummaryPage.scrollToRightmostPosition()
    await vairifySummaryPage.page.waitForTimeout(1000)

    await vairifySummaryPage.checkColumnHeaderText(
      'Nitrogen Dioxide (µg/m³)',
      'Nitrogen Dioxide (µg/m³)',
    )
    await vairifySummaryPage.checkColumnHeaderText(
      'Ozone (µg/m³)',
      'Ozone (µg/m³)',
    )
    await vairifySummaryPage.checkColumnHeaderText(
      'Sulphur Dioxide (µg/m³)',
      'Sulphur Dioxide (µg/m³)',
    )
  })

  // Mocked + live env
  test('Verify numbers in cells have no more than 1 decimal place ', async ({
    page,
  }) => {
    const vairifySummaryPage = await setupVairifySummaryPage(page)
    await vairifySummaryPage.checkCellNumberFormat()
  })

  test('Kyiv location to be true, regardless of measurement availability', async ({
    page,
  }) => {
    const vairifySummaryPage = await setupVairifySummaryPage(page)
    await vairifySummaryPage.checkKyivLocation()
  })

  test('Check API mocked accurately', async ({ page }) => {
    const vairifySummaryPage = await setupVairifySummaryPage(page)

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
    page,
  }) => {
    const vairifySummaryPage = await setupVairifySummaryPage(page)
    await vairifySummaryPage.assertDiffColumn()
  })
})
