import { type Locator, type Page, expect } from '@playwright/test'

import { BasePage } from './base_page'

export class SummaryPage extends BasePage {
  readonly page: Page

  readonly agCell: Locator
  readonly allCells: Locator
  readonly grid: Locator
  readonly highlightValuesToggle: Locator
  readonly locationFilterIcon: Locator
  readonly locationFilterTextBox: Locator
  readonly scroller: Locator
  readonly timeRange: Locator
  readonly title: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.agCell = page.locator('role=gridcell')
    this.allCells = page.locator('[role=gridcell]')
    this.grid = page.getByTestId('summary-grid')
    this.highlightValuesToggle = page
      .locator('div')
      .filter({ hasText: /^Highlight all AQI values$/ })
      .getByRole('checkbox')
    this.locationFilterIcon = page.locator(
      '//span[contains(@class, "ag-icon-menu")]',
    )
    this.locationFilterTextBox = page.getByLabel('Filter Value')

    this.scroller = page.locator('.ag-body-horizontal-scroll-viewport')
    this.timeRange = page.getByText('Time Range:')
    this.title = page.locator('title')
  }

  async assertGridAttributes(
    attribute: string,
    expectedData: string[][],
  ): Promise<void> {
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

  async calculateForecastDifference(): Promise<number[]> {
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

  async checkCellNumberFormat(): Promise<void> {
    const cells = await this.agCell.all()
    for (const cell of cells) {
      const cellText = await cell.textContent()
      await this.checkNumbersHaveOneDecimalOnly(cellText || '')
    }
  }
  async checkNumbersHaveOneDecimalOnly(text: string): Promise<void> {
    const number = parseFloat(text)
    if (!isNaN(number)) {
      const decimalPart = text.split('.')[1]
      if (decimalPart && decimalPart.length > 1) {
        throw new Error(`Number ${text} has more than one decimal place`)
      }
    }
  }

  async filterByCity(cityName: string, page: Page) {
    await this.locationFilterIcon.click()
    await this.locationFilterTextBox.click()
    await this.locationFilterTextBox.fill(cityName)
    await this.grid.click()
    await this.waitForLoad()
    // awaiting a div to be hidden that matches another locator needed when asserting the grid
    await page
      .locator('.ag-center-cols-container > div:nth-child(23) > div')
      .first()
      .waitFor({ state: 'hidden' })
  }

  async getColumnHeaderAndText(
    name: string,
    expectedText: string,
  ): Promise<void> {
    const header = this.page.getByRole('columnheader', { name })
    await header.waitFor({ state: 'visible' })
    await expect(header).toHaveText(expectedText)
  }

  async scrollToRightmostPosition(): Promise<void> {
    await this.scroller.evaluate((element: HTMLElement) => {
      element.scrollLeft = element.scrollWidth
    })
  }

  async textCellSearch(searchText: string): Promise<number> {
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

  async waitForLoad(): Promise<void> {
    await this.page.waitForSelector('.ag-root', { state: 'visible' })
    await this.page.waitForSelector('.ag-header-cell', {
      state: 'visible',
    })
  }
}
