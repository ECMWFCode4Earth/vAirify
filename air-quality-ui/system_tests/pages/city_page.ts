import { type Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'
import { waitForIdleNetwork } from '../utils/helper_methods'

export class CityPage extends BasePage {
  readonly page: Page

  readonly aqiChart: Locator
  readonly apiForecastAqi: object
  readonly scroller: Locator
  readonly title: Locator
  readonly toolbarNavigation: Locator

  constructor(page: Page, apiForecastAqi: object) {
    super(page)
    this.page = page

    this.aqiChart = page.getByTestId('main-comparison-chart').locator('canvas')
    this.apiForecastAqi = apiForecastAqi
    this.scroller = page.locator('.ag-body-horizontal-scroll-viewport')
    this.title = page.locator('title')
    this.toolbarNavigation = page.getByLabel('Toolbar with site navigation')
  }

  async captureChartScreenshot() {
    await waitForIdleNetwork(this.page, this.aqiChart)
    return await this.aqiChart.screenshot()
  }

  textFinder(textToFind: string) {
    return this.page.getByText(textToFind)
  }

  toolbarTextFinder(textToFind: string) {
    return this.toolbarNavigation.getByText(textToFind)
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
