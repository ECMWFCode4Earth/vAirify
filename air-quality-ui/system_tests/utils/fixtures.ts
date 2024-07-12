import { test as base } from '@playwright/test'

import { mockForecastObject, mockMeasurementsObject } from './graph_aqi_mock'
import { apiForecast, apiSummary } from './mocked_api'
import { Banner } from '../pages/banner'
import { VairifyCityPage } from '../pages/city_page'
import { VairifySummaryPage } from '../pages/summary_page'

type Fixtures = {
  banner: Banner
  vairifySummaryPage: VairifySummaryPage
  vairifyCityPage: VairifyCityPage
}
const test = base.extend<Fixtures>({
  banner: async ({ page }, use) => {
    await use(new Banner(page))
  },
  vairifySummaryPage: async ({ page }, use) => {
    await use(new VairifySummaryPage(page, apiForecast, apiSummary))
  },
  vairifyCityPage: async ({ page }, use) => {
    await use(new VairifyCityPage(page, mockForecastObject, mockMeasurementsObject))
  },
})

export { test }
export { expect } from '@playwright/test'
