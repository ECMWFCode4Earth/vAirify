import { type Locator, type Page, expect } from '@playwright/test'

export class VairifySummaryPage {
  readonly page: Page
  readonly apiForecast: object
  readonly apiSummary: object
  readonly title: Locator
  readonly scroller: Locator
  readonly agCell: Locator
  readonly allCells: Locator

  constructor(page: Page, apiForecast: object, apiSummary: object) {
    this.page = page
    this.apiForecast = apiForecast
    this.apiSummary = apiSummary
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.agCell = this.page.locator('role=gridcell')
    this.allCells = this.page.locator('[role=gridcell]')
  }
  async clickButton(buttonName: string) {
    await this.page.getByRole('link', { name: buttonName }).click()
  }

  async gotoSummaryPage() {
    await this.page.goto('/city/summary')
  }

  async getTitle() {
    const title = await this.page.title()
    return title
  }

  async getColumnHeaderAndText(name: string, expectedText: string) {
    const header = this.page.getByRole('columnheader', { name })
    await header.waitFor({ state: 'visible' })
    await expect(header).toHaveText(expectedText)
  }

  async scrollToRightmostPosition() {
    await this.scroller.evaluate((element: HTMLElement) => {
      element.scrollLeft = element.scrollWidth
    })
  }

  async waitForGridVisible() {
    await this.page.waitForSelector('.ag-root', { state: 'visible' })
    await this.page.waitForSelector('.ag-header-cell', { state: 'visible' })
  }

  async checkNumbersHaveOneDecimalOnly(text: string) {
    const number = parseFloat(text)
    if (!isNaN(number)) {
      const decimalPart = text.split('.')[1]
      if (decimalPart && decimalPart.length > 1) {
        throw new Error(`Number ${text} has more than one decimal place`)
      }
    }
  }

  async checkCellNumberFormat() {
    const cells = await this.agCell.all()
    for (const cell of cells) {
      const cellText = await cell.textContent()
      await this.checkNumbersHaveOneDecimalOnly(cellText || '')
    }
  }

  async textCellSearch(searchText: string) {
    const cells = await this.page.locator('.ag-cell').all()
    let count = 0
    for (const cell of cells) {
      const cellText = await cell.innerText()
      if (cellText.includes(searchText)) {
        count++
      }
    }
    return count
  }

  async assertGridValues(expectedData: string[][]) {
    for (let rowIndex = 0; rowIndex < expectedData.length; rowIndex++) {
      const row = expectedData[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellLocator = this.page.locator(
          `.ag-center-cols-container .ag-row:nth-child(${rowIndex + 1}) .ag-cell:nth-child(${colIndex + 1})`
        )
        const cellText = await cellLocator.innerText()
        expect(cellText.trim()).toBe(row[colIndex])
      }
    }
  }

  async calculateForecastDifference() {
    const rows = await this.page
      .locator('.ag-center-cols-container .ag-row')
      .count()
    const differences: number[] = []

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const forecastCellLocator = this.page.locator(
        `.ag-center-cols-container .ag-row:nth-child(${rowIndex + 1}) .ag-cell:nth-child(1)`
      )
      const measuredCellLocator = this.page.locator(
        `.ag-center-cols-container .ag-row:nth-child(${rowIndex + 1}) .ag-cell:nth-child(2)`
      )

      const forecastText = await forecastCellLocator.innerText()
      const measuredText = await measuredCellLocator.innerText()

      const forecast = parseInt(forecastText.trim())
      const measured = parseInt(measuredText.trim())
      const calculation = Math.abs(forecast - measured)

      differences.push(calculation)
    }
    return differences.filter((d) => !isNaN(d))
  }

  async setupApiRoute(endpointUrl: string, mockedAPIResponse: object) {
    await this.page.route(endpointUrl, async (route) => {
      await route.fulfill({ json: mockedAPIResponse })
    })
  }

  async setupPage(
    mockedForecastResponse: object,
    mockedMeasurementSummaryResponse: object
  ) {
    await this.setupApiRoute(
      '*/**/air-pollutant/forecast*',
      mockedForecastResponse
    )
    await this.setupApiRoute(
      '*/**/air-pollutant/measurements/summary*',
      mockedMeasurementSummaryResponse
    )
    await this.gotoSummaryPage()
    await this.waitForGridVisible()
  }
}
