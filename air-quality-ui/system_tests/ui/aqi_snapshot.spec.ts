import { expect, test } from '../utils/fixtures'

test('AQI snapshot assertion', async ({ vairifyCityPage }) => {
  //   await page.clock.setFixedTime(new Date("2024-07-02T15:00:00Z"));
  await vairifyCityPage.setupCityPageGraph()
  await expect(vairifyCityPage.textFinder('Rio de Janerio')).toBeVisible()
})
