import { type Locator, type Page } from '@playwright/test'

export class VairifyCityPage {
  readonly page: Page
  readonly title: Locator
  readonly scroller: Locator
  readonly apiForecastAqi: object
  readonly aqiChart: Locator
  readonly toolbarNavigation: Locator

  constructor(page: Page, apiForecastAqi: object) {
    this.page = page
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.apiForecastAqi = apiForecastAqi
    this.aqiChart = this.page
      .getByTestId('main-comparison-chart')
      .locator('canvas')
    this.toolbarNavigation = this.page.getByLabel(
      'Toolbar with site navigation',
    )
  }

  async captureChartScreenshot() {
    await this.waitForIdleNetwork()
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

  async waitForIdleNetwork() {
    try {
      await this.aqiChart.waitFor()

      const idleTime = 1000
      const checkInterval = 200
      const timeout = 30000

      let lastActivityTime = Date.now()

      const checkNetworkIdle = async () => {
        while (Date.now() - lastActivityTime < idleTime) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval))
          const networkRequests = await this.page.evaluate(() => {
            return performance
              .getEntriesByType('resource')
              .filter((entry: PerformanceEntry) => {
                const resourceEntry = entry as PerformanceResourceTiming
                return (
                  resourceEntry.initiatorType === 'xmlhttprequest' ||
                  resourceEntry.initiatorType === 'fetch'
                )
              }).length
          })
          if (networkRequests === 0) {
            lastActivityTime = Date.now()
          }
        }
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network idle timeout')), timeout),
      )
      await Promise.race([checkNetworkIdle(), timeoutPromise])
    } catch (error) {
      console.error('Error waiting for chart animation:', error)
      throw error
    }
  }
}
