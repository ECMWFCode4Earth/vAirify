import { expect, test } from '@playwright/test'

import { apiForecast, apiSummary } from './mocked_api.ts'

test('Title is vAirify', async ({ page }) => {
  await page.goto('/city/summary')
  const title = await page.title()
  expect(title).toBe('vAirify')
})

// Mocked + live env
test('Header visibility check', async ({ page }) => {
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

  const headers = [
    { name: 'AQI Level', visible: true },
    { name: 'PM 2.5 (µg/m³)', visible: true },
    { name: 'PM 10 (µg/m³)', visible: true },
    { name: 'Nitrogen Dioxide (µg/m³)', visible: true },
    { name: 'Ozone (µg/m³)', visible: true },
    { name: 'Sulphur Dioxide (µg/m³)', visible: true },
  ]

  for (const { name, visible } of headers) {
    const header = page.getByRole('columnheader', { name })

    const isVisible = await header.isVisible()
    console.log(`Header "${name}" is ${isVisible ? 'visible' : 'hidden'}`)

    if (visible) {
      await expect(header).toBeVisible()
    } else {
      await expect(header).toBeHidden()
    }
  }
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

test('Kyiv location to be false', async ({ page }) => {
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

  const unwantedText = 'Kyiv'
  const cells = await page.locator('.ag-cell').all()
  for (const cell of cells) {
    const cellText = await cell.innerText()
    expect(cellText).not.toContain(unwantedText)
  }
})
