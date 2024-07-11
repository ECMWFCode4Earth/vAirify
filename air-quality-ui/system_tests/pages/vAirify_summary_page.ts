import { type Locator, type Page, expect } from '@playwright/test'

import { BasePage } from './base_page'

export class VairifySummaryPage extends BasePage {
  readonly page: Page
  readonly title: Locator
  readonly scroller: Locator
  readonly agCell: Locator
  readonly allCells: Locator
  readonly forecastBaseTimeText: Locator

  constructor(page: Page) {
    super(page)
    this.page = page
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.agCell = this.page.locator('role=gridcell')
    this.allCells = this.page.locator('[role=gridcell]')
    this.forecastBaseTimeText = this.page.locator(
      "//div[@class='_summary-container_1n5zu_1']/div[1]/div[1]",
    )
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

  async assertGridValues(expectedData: string[][]) {
    for (let rowIndex = 0; rowIndex < expectedData.length; rowIndex++) {
      const row = expectedData[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellLocator = this.page.locator(
          `//div[@aria-rowindex='${rowIndex + 3}']//div[@aria-colindex='${colIndex + 2}']`,
        )
        await cellLocator.scrollIntoViewIfNeeded()
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
    mockedMeasurementSummaryResponse: object,
  ) {
    await this.setupApiRoute(
      '*/**/air-pollutant/forecast*',
      mockedForecastResponse,
    )
    await this.setupApiRoute(
      '*/**/air-pollutant/measurements/summary*',
      mockedMeasurementSummaryResponse,
    )
    await this.goTo()
  }

  async calculateExpectedForecastBaseTimeFromDate(
    mockDatetimeNow: Date,
  ): Promise<Date> {
    const time24HrsAgoMilliseconds =
      mockDatetimeNow.getTime() - 24 * 60 * 60 * 1000
    const datetime24HrsAgo = new Date(time24HrsAgoMilliseconds)
    const hours24HrsAgo = datetime24HrsAgo.getUTCHours()
    const expectedForecastBaseTime: Date = datetime24HrsAgo

    expectedForecastBaseTime.setMinutes(0)
    expectedForecastBaseTime.setSeconds(0)
    expectedForecastBaseTime.setMilliseconds(0)

    if (10 > hours24HrsAgo) {
      // go back another day
      const time48HrsAgoMilliseconds =
        mockDatetimeNow.getTime() - 24 * 60 * 60 * 1000 * 2
      const datetime48HrsAgo = new Date(time48HrsAgoMilliseconds)
      expectedForecastBaseTime.setUTCDate(datetime48HrsAgo.getUTCDate())
      expectedForecastBaseTime.setUTCHours(12)
    } else if (22 > hours24HrsAgo && hours24HrsAgo >= 10) {
      expectedForecastBaseTime.setUTCHours(0)
    } else {
      expectedForecastBaseTime.setUTCHours(12)
    }

    return expectedForecastBaseTime
  }

  async calculateExpectedVolumeOfRequests(
    mockDatetimeNow: Date,
  ): Promise<number> {
    const expectedForecastBaseTime =
      await this.calculateExpectedForecastBaseTimeFromDate(mockDatetimeNow)

    // Difference between time now and base time
    const timeDifferentialMs =
      mockDatetimeNow.getTime() - expectedForecastBaseTime.getTime()
    const timeDifferentialHours = timeDifferentialMs / (1000 * 60 * 60)
    const threeHrIncrements = Math.floor(timeDifferentialHours / 3)

    // There will be 1 request when there is 0 difference
    return threeHrIncrements + 1
  }

  async getExpectedRequestForecastBaseTime(
    mockSystemDate: Date,
  ): Promise<string> {
    const expectedForecastBaseTimeDate =
      await this.calculateExpectedForecastBaseTimeFromDate(mockSystemDate)
    const isoDate = expectedForecastBaseTimeDate.toISOString()
    return encodeURIComponent(isoDate)
  }
}
