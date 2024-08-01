import { type Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'
import { waitForIdleNetwork } from '../utils/helper_methods'

export class CityPage extends BasePage {
  readonly page: Page

  readonly aqiChart: Locator
  readonly datePicker: Locator
  readonly no2Chart: Locator
  readonly o3Chart: Locator
  readonly pm10Chart: Locator
  readonly pm2_5Chart: Locator
  readonly scroller: Locator
  readonly siteDropdown: string
  readonly siteForm: Locator
  readonly so2Chart: Locator
  readonly title: Locator
  readonly toolbarNavigation: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.aqiChart = page.getByTestId('aqi_chart').locator('canvas')
    this.datePicker = page.getByPlaceholder('DD/MM/YYYY hh:mm')
    this.no2Chart = page.getByTestId('site_measurements_chart_no2')
    this.o3Chart = page.getByTestId('site_measurements_chart_o3')
    this.pm10Chart = page.getByTestId('site_measurements_chart_pm10')
    this.pm2_5Chart = page.getByTestId('site_measurements_chart_pm2_5')
    this.scroller = page.locator('.ag-body-horizontal-scroll-viewport')
    this.siteDropdown = 'svg.css-tj5bde-Svg'
    this.siteForm = page.getByTestId('sites-form')
    this.so2Chart = page.getByTestId('site_measurements_chart_so2')
    this.title = page.locator('title')
    this.toolbarNavigation = page.getByLabel('Toolbar with site navigation')
  }

  async captureChartScreenshot(chartElement: Locator) {
    await waitForIdleNetwork(this.page, chartElement)
    return await chartElement.screenshot()
  }

  async svgDropDownClick() {
    const svgButton = await this.page.$(this.siteDropdown)
    if (svgButton) {
      await svgButton.scrollIntoViewIfNeeded()
      await svgButton.click()
    } else {
      throw new Error('SVG button not found')
    }
  }

  async dropDownSelect(siteName: string) {
    await this.svgDropDownClick()
    const option = this.page.getByRole("option", { name: siteName });
    await option.scrollIntoViewIfNeeded();
    await option.click();
  }

  async siteRemover(location: string) {
    await this.siteForm.waitFor({ state: 'visible' })
    await this.siteForm.scrollIntoViewIfNeeded()
    const siteDeselect = this.page.getByLabel(`Remove ${location}`)
    await siteDeselect.click()
  }

  async setBaseTime(baseTime: string) {
    return this.datePicker.fill(baseTime)
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
    await this.so2Chart.waitFor({ state: 'visible' })
  }
}
