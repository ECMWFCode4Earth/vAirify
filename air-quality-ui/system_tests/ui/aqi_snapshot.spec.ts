import { expect, test } from '../utils/fixtures'

test('AQI snapshot assertion', async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph()
  await expect(vairifyCityPage.textFinder('Rio de Janeiro')).toBeVisible()
  const chartShot = await vairifyCityPage.captureChartScreenshot()
  expect(chartShot).toMatchSnapshot('rio-aqi-graph.png')
})

test('No mocks', async ({ vairifyCityPage, context }) => {
  await vairifyCityPage.gotoRioCityPage()
  await context.route('**/*', (route) => route.abort())
  await vairifyCityPage.waitForLoadingScreen()
  await expect(vairifyCityPage.loadingIcon).toBeVisible()
})
