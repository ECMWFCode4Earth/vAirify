import { type Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'
import { waitForIdleNetwork } from '../utils/helper_methods'

export class CityPage extends BasePage {
  readonly page: Page
  readonly title: Locator
  readonly scroller: Locator

  readonly aqiChart: Locator
  readonly toolbarNavigation: Locator
  readonly pm2_5Chart: Locator
  readonly pm10Chart: Locator
  readonly no2Chart: Locator
  readonly o3Chart: Locator
  readonly so2Chart: Locator
  readonly datePicker: Locator
  readonly siteForm: Locator

  constructor(page: Page) {
    super(page)
    this.page = page
    this.datePicker = this.page.getByPlaceholder('DD/MM/YYYY hh:mm')
    this.pm2_5Chart = this.page.getByTestId('site_measurements_chart_pm2_5')
    this.pm10Chart = this.page.getByTestId('site_measurements_chart_pm10')
    this.no2Chart = this.page.getByTestId('site_measurements_chart_no2')
    this.o3Chart = this.page.getByTestId('site_measurements_chart_o3')
    this.so2Chart = this.page.getByTestId('site_measurements_chart_so2')
    this.siteForm = this.page.getByTestId('sites-form')
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')

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
    await this.siteForm.waitFor({ state: 'visible' })
    const siteDeselect = this.page.getByLabel(`Remove ${location}`)
    await siteDeselect.click()
  }

  async captureChartScreenshot(chartElement: Locator) {
    await waitForIdleNetwork(this.page, chartElement)
    return await chartElement.screenshot()
  }

  textFinder(textToFind: string) {
    return this.page.getByText(textToFind)
  }

  toolbarTextFinder(textToFind: string) {
    return this.toolbarNavigation.getByText(textToFind)
  }

  async waitForAllGraphsToBeVisible() {
    await this.aqiChart.waitFor({ state: 'visible' })
    await this.pm2_5Chart.waitFor({ state: 'visible' })
    await this.pm10Chart.waitFor({ state: 'visible' })
    await this.o3Chart.waitFor({ state: 'visible' })
    await this.no2Chart.waitFor({ state: 'visible' })
  }
}
