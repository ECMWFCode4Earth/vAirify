import { type Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'
import { waitForIdleNetwork } from '../utils/helper_methods'

export class CityPage extends BasePage {
  readonly page: Page
  readonly title: Locator
  readonly scroller: Locator
  readonly mockForecastObject: object
  readonly mockMeasurementsObject: object
  readonly aqiChart: Locator
  readonly toolbarNavigation: Locator
  readonly pm2_5Chart: Locator
  readonly pm10Chart: Locator
  readonly no2Chart: Locator
  readonly o3Chart: Locator
  readonly datePicker: Locator
  readonly siteForm: Locator

  constructor(
    page: Page,
    mockForecastObject: object,
    mockMeasurementsObject: object,
  ) {
    super(page)
    this.page = page
    this.datePicker = this.page.getByPlaceholder('DD/MM/YYYY hh:mm')
    this.pm2_5Chart = this.page.getByTestId('site_measurements_chart_pm2_5')
    this.pm10Chart = this.page.getByTestId('site_measurements_chart_pm10')
    this.no2Chart = this.page.getByTestId('site_measurements_chart_no2')
    this.o3Chart = this.page.getByTestId('site_measurements_chart_o3')
    this.siteForm = this.page.getByTestId('sites-form')
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.mockForecastObject = mockForecastObject
    this.mockMeasurementsObject = mockMeasurementsObject
    this.aqiChart = this.page
      .getByTestId('main-comparison-chart')
      .locator('canvas')
    this.toolbarNavigation = this.page.getByLabel(
      'Toolbar with site navigation',
    )
  }
  async setBaseTime(baseTime: string) {
    return this.datePicker.fill(baseTime)
  }

  async siteRemover(location: string) {
    const siteDeselect = this.page.getByLabel(`Remove ${location}`)
    await siteDeselect.click()
  }

  async captureAqiChartScreenshot() {
    await waitForIdleNetwork(this.page, this.aqiChart)
    return await this.aqiChart.screenshot()
  }

  async capturePm2_5ChartScreenshot() {
    await waitForIdleNetwork(this.page, this.pm2_5Chart)
    return await this.pm2_5Chart.screenshot()
  }
  async capturePm10ChartScreenshot() {
    await waitForIdleNetwork(this.page, this.pm10Chart)
    return await this.pm10Chart.screenshot()
  }
  async captureO3ChartScreenshot() {
    await waitForIdleNetwork(this.page, this.o3Chart)
    return await this.o3Chart.screenshot()
  }
  async captureNo2ChartScreenshot() {
    await waitForIdleNetwork(this.page, this.no2Chart)
    return await this.no2Chart.screenshot()
  }

  textFinder(textToFind: string) {
    return this.page.getByText(textToFind)
  }

  toolbarTextFinder(textToFind: string) {
    return this.toolbarNavigation.getByText(textToFind)
  }

  async setupRioDeJaneiroRoute() {
    await this.page.route('*/**/air-pollutant/forecast*', async (route) => {
      await route.fulfill({ json: this.mockForecastObject })
    })
    await this.page.route('*/**/air-pollutant/measurements*', async (route) => {
      await route.fulfill({ json: this.mockMeasurementsObject })
    })
  }

  async waitForAllGraphsToBeVisible() {
    await this.aqiChart.waitFor({ state: 'visible' })
    await this.pm2_5Chart.waitFor({ state: 'visible' })
    await this.pm10Chart.waitFor({ state: 'visible' })
    await this.o3Chart.waitFor({ state: 'visible' })
    await this.no2Chart.waitFor({ state: 'visible' })
  }

  async gotoRioCityPage() {
    await this.page.goto('/city/Rio%20de%20Janeiro')
  }

  async setupCityPageGraph() {
    await this.setupRioDeJaneiroRoute()
    await this.gotoRioCityPage()
    await this.waitForAllGraphsToBeVisible()
  }

  async setupCityPageWithMockData(
    mockedForecastResponse: object,
    mockedMeasurementsCityPageResponse?: object,
  ) {
    if (typeof mockedMeasurementsCityPageResponse !== 'undefined') {
      await this.setupApiRoute(
        '*/**/air-pollutant/measurements*',
        mockedMeasurementsCityPageResponse,
      )
    }
    await this.setupApiRoute(
      '*/**/air-pollutant/forecast*',
      mockedForecastResponse,
    )
    await this.gotoRioCityPage()
  }
}
