import { expect, test } from '../utils/fixtures'

test('AQI snapshot assertion', async ({ cityPage }) => {
  await cityPage.setupCityPageGraph()
  await expect(cityPage.textFinder('Rio de Janeiro')).toBeVisible()
  const chartShot = await cityPage.captureChartScreenshot()
  expect(chartShot).toMatchSnapshot('rio-aqi-graph.png')
})
