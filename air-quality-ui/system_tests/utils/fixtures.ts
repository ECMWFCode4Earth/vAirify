import { test as base } from '@playwright/test'

import { VairifyCityPage } from '../pages/vAirify_city_page'
import { VairifySummaryPage } from '../pages/vAirify_summary_page'

type Fixtures = {
  vairifySummaryPage: VairifySummaryPage
  vairifyCityPage: VairifyCityPage
}
const test = base.extend<Fixtures>({
  vairifySummaryPage: async ({ page }, use) => {
    await use(new VairifySummaryPage(page))
  },
  vairifyCityPage: async ({ page }, use) => {
    await use(new VairifyCityPage(page))
  },
})

export { test }
export { expect } from '@playwright/test'
