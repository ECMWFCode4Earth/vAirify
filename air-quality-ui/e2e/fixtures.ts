import { test as base } from '@playwright/test'

import { apiForecast, apiSummary } from './mocked_api'
import { VairifySummaryPage } from './vAirify_summary_page'

type Fixtures = { vairifySummaryPage: VairifySummaryPage }
const test = base.extend<Fixtures>({
  vairifySummaryPage: async ({ page }, use) => {
    await use(new VairifySummaryPage(page, apiForecast, apiSummary))
  },
})

export { test }
export { expect } from '@playwright/test'
