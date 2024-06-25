import { expect, test } from '@playwright/test'

import { apiForecast, apiSummary } from './mocked_api.ts'
import { VarifySummaryPage } from './vAirify_summary_model.ts'

test('Title is vAirify', async ({ page }) => {
  const vairifySummaryPage = new VarifySummaryPage(
    page,
    apiForecast,
    apiSummary,
  )
  await vairifySummaryPage.gotoSummaryPage()
  const title = await page.title()
  expect(title).toBe('vAirify')
})

// Mocked + live env
test('Header text check', async ({ page }) => {
  const vairifySummaryPage = new VarifySummaryPage(
    page,
    apiForecast,
    apiSummary,
  )
  await vairifySummaryPage.setupApiRoutes()
  await vairifySummaryPage.gotoSummaryPage()

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
test('Cell number format check', async ({ page }) => {
  const varifySummaryPage = new VarifySummaryPage(page, apiForecast, apiSummary)
  await varifySummaryPage.setupApiRoutes()
  await varifySummaryPage.gotoSummaryPage()
  await varifySummaryPage.waitForGridVisible()
  await varifySummaryPage.checkCellNumberFormat()
})

test('Kyiv location to be true, regardless of measurement availability', async ({
  page,
}) => {
  const vairifySummaryPage = new VarifySummaryPage(
    page,
    apiForecast,
    apiSummary,
  )
  await vairifySummaryPage.setupApiRoutes()
  await vairifySummaryPage.gotoSummaryPage()
  await vairifySummaryPage.waitForGridVisible()
  await vairifySummaryPage.checkKyivLocation()
})
