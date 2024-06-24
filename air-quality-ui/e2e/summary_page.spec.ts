import { expect, test } from '@playwright/test'

import { apiForecast, apiSummary } from './mocked_api.ts'

test('Title is vAirify', async ({ page }) => {
  await page.goto('/city/summary')
  const title = await page.title()
  expect(title).toBe('vAirify')
})

// Mocked + live env
test('Header text check', async ({ page }) => {
  await page.route('*/**/air-pollutant/forecast*', async (route) => {
    await route.fulfill({ json: apiForecast })
  })
  await page.route(
    '*/**/air-pollutant/measurements/summary*',
    async (route) => {
      await route.fulfill({ json: apiSummary })
    },
  )
  await page.goto('/city/summary')

  const checkColumnHeaderText = async (name, expectedText) => {
    const header = page.getByRole('columnheader', { name })
    await header.waitFor({ state: 'visible' })
    await expect(header).toHaveText(expectedText)
  }

  await checkColumnHeaderText('AQI Level', 'AQI Level')
  await checkColumnHeaderText('PM 2.5 (µg/m³)', 'PM 2.5 (µg/m³)')
  await checkColumnHeaderText('PM 10 (µg/m³)', 'PM 10 (µg/m³)')
  const scroller = page.locator('.ag-body-horizontal-scroll-viewport')
  await scroller.evaluate((element: HTMLElement) => {
    element.scrollLeft = element.scrollWidth
  })
  // Optionally, wait for any further actions or assertions after scrolling
  await page.waitForTimeout(1000)
  await checkColumnHeaderText(
    'Nitrogen Dioxide (µg/m³)',
    'Nitrogen Dioxide (µg/m³)',
  )
  await checkColumnHeaderText('Ozone (µg/m³)', 'Ozone (µg/m³)')
  await checkColumnHeaderText(
    'Sulphur Dioxide (µg/m³)',
    'Sulphur Dioxide (µg/m³)',
  )
})

// Mocked + live env
test('Cell number format check', async ({ page }) => {
  await page.route('*/**/air-pollutant/forecast*', async (route) => {
    await route.fulfill({ json: apiForecast })
  })
  await page.route(
    '*/**/air-pollutant/measurements/summary*',
    async (route) => {
      await route.fulfill({ json: apiSummary })
    },
  )
  await page.goto('/city/summary')
  await page.waitForSelector('.ag-root', { state: 'visible' })
  await page.waitForSelector('.ag-header-cell', { state: 'visible' })

  const checkNumberFormat = async (text) => {
    const number = parseFloat(text)
    if (!isNaN(number)) {
      const decimalPart = text.split('.')[1]
      if (decimalPart && decimalPart.length > 1) {
        throw new Error(`Number ${text} has more than one decimal place`)
      }
    }
  }
  const cells = await page.locator('role=gridcell').all()
  for (const cell of cells) {
    const cellText = await cell.textContent()
    await checkNumberFormat(cellText)
  }
})

test('Kyiv location to be true, regardless of measurement availability', async ({
  page,
}) => {
  await page.route('*/**/air-pollutant/forecast*', async (route) => {
    await route.fulfill({ json: apiForecast })
  })
  await page.route(
    '*/**/air-pollutant/measurements/summary*',
    async (route) => {
      await route.fulfill({ json: apiSummary })
    },
  )
  await page.goto('/city/summary')
  await page.waitForSelector('.ag-root', { state: 'visible' })
  await page.waitForSelector('.ag-header-cell', { state: 'visible' })

  const textQuery = 'Kyiv'
  const cells = await page.locator('.ag-cell').all()
  let count = 0
  for (const cell of cells) {
    const cellText = await cell.innerText()
    if (cellText.includes(textQuery)) {
      count++
    }
  }
  expect(count).toBe(1)
})
