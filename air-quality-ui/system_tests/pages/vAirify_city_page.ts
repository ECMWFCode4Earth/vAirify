import { type Locator, type Page } from '@playwright/test'

export class VairifyCityPage {
  readonly page: Page
  readonly title: Locator
  readonly scroller: Locator
  readonly apiForecastAqi: object
  readonly aqiChart: Locator

  constructor(page: Page, apiForecastAqi: object) {
    this.page = page
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.apiForecastAqi = apiForecastAqi
    this.aqiChart = this.page
      .getByTestId('main-comparison-chart')
      .locator('canvas')
  }

  textFinder(textToFind: string) {
    return this.page.getByText(textToFind)
  }

  async setupRioDeJaneiroRoute() {
    const genQuery = '*/**/air-pollutant/forecast*'
    await this.page.route(genQuery, async (route) => {
      await route.fulfill({ json: this.apiForecastAqi })
    })
  }
  async waitForGraphVisible() {
    await this.aqiChart.waitFor({ state: 'visible' })
  }
  async gotoRioCityPage() {
    await this.page.goto('/city/Rio%20de%20Janeiro')
  }

  async setupCityPageGraph() {
    await this.setupRioDeJaneiroRoute()
    await this.gotoRioCityPage()
    await this.waitForGraphVisible()
  }
}
