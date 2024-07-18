import { type Locator, type Page, expect } from '@playwright/test'

import { BasePage } from './base_page'

export class SummaryPage extends BasePage {
  readonly page: Page

  readonly agCell: Locator
  readonly allCells: Locator
  readonly scroller: Locator
  readonly title: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.agCell = page.locator('role=gridcell')
    this.allCells = page.locator('[role=gridcell]')
    this.scroller = page.locator('.ag-body-horizontal-scroll-viewport')
    this.title = page.locator('title')
  }

  async goTo() {
    await this.page.goto('/city/summary')
    await this.page.waitForSelector('.ag-root', { state: 'visible' })
    await this.page.waitForSelector('.ag-header-cell', { state: 'visible' })
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

  async assertGridAttributes(attribute: string, expectedData: string[][]) {
    for (let rowIndex = 0; rowIndex < expectedData.length; rowIndex++) {
      const row: string[] = expectedData[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellLocator: Locator = this.page.locator(
          `//div[@aria-rowindex='${rowIndex + 3}']//div[@aria-colindex='${colIndex + 2}']`,
        )
        await cellLocator.scrollIntoViewIfNeeded()
        if (attribute == 'values') {
          const cellText: string = await cellLocator.innerText()
          expect(cellText.trim()).toBe(row[colIndex])
        } else if (attribute == 'colours') {
          await expect(cellLocator).toHaveCSS('background-color', row[colIndex])
        } else {
          throw new Error('Invalid attribute value')
        }
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
        `.ag-center-cols-container .ag-row:nth-child(${rowIndex + 1}) .ag-cell:nth-child(1)`,
      )
      const measuredCellLocator = this.page.locator(
        `.ag-center-cols-container .ag-row:nth-child(${rowIndex + 1}) .ag-cell:nth-child(2)`,
      )

      const forecastText = await forecastCellLocator.innerText()
      const measuredText = await measuredCellLocator.innerText()

      const forecast = parseInt(forecastText.trim())
      const measured = parseInt(measuredText.trim())
      const calculation = forecast - measured

      differences.push(calculation)
    }
    return differences.filter((d) => !isNaN(d))
  }

  async setupPageWithMockData(
    mockedForecastResponse: object,
    mockedMeasurementSummaryResponse?: object,
  ) {
    if (typeof mockedMeasurementSummaryResponse !== 'undefined') {
      await this.setupApiRoute(
        '*/**/air-pollutant/measurements/summary*',
        mockedMeasurementSummaryResponse,
      )
    }
    await this.setupApiRoute(
      '*/**/air-pollutant/forecast*',
      mockedForecastResponse,
    )
    await this.goTo()
  }
}
