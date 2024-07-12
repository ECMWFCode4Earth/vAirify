import { test as base } from '@playwright/test'

import { apiForecastAqi } from './graph_aqi_mock'
import { apiForecast, apiSummary } from './mocked_api'
import { VairifyCityPage } from '../pages/vAirify_city_page'
import { VairifySummaryPage } from '../pages/vAirify_summary_page'

type Fixtures = {
  vairifySummaryPage: VairifySummaryPage
  vairifyCityPage: VairifyCityPage
}
const test = base.extend<Fixtures>({
  vairifySummaryPage: async ({ page }, use) => {
    await use(new VairifySummaryPage(page, apiForecast, apiSummary))
  },
  vairifyCityPage: async ({ page }, use) => {
    await use(new VairifyCityPage(page, apiForecastAqi))
  },
})

export { test }
export { expect } from '@playwright/test'
