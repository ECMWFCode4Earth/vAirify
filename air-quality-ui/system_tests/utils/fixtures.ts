import { test as base } from '@playwright/test'

import { apiForecastAqi } from './graph_aqi_mock'
import { Banner } from '../pages/banner'
import { BasePage } from '../pages/base_page'
import { CityPage } from '../pages/city_page'
import { SummaryPage } from '../pages/summary_page'

type Fixtures = {
  banner: Banner
  basePage: BasePage
  cityPage: CityPage
  summaryPage: SummaryPage
}
const test = base.extend<Fixtures>({
  banner: async ({ page }, use) => {
    await use(new Banner(page))
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page))
  },
  summaryPage: async ({ page }, use) => {
    await use(new SummaryPage(page))
  },
  cityPage: async ({ page }, use) => {
    await use(new CityPage(page, apiForecastAqi))
  },
})

export { test }
export { expect } from '@playwright/test'
