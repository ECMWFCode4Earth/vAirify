import { expect, test } from '../utils/fixtures'

test('vAirify logo is visible', async ({ vairifyCityPage, banner }) => {
  await vairifyCityPage.gotoRioCityPage()
  await expect(banner.logo).toBeVisible()
})

test('AQI snapshot assertion', async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph()
  await expect(vairifyCityPage.textFinder('Rio de Janeiro')).toBeVisible()
  const chartShot = await vairifyCityPage.captureChartScreenshot()
  expect(chartShot).toMatchSnapshot('rio-aqi-graph.png')
})

test('Mocked response breadcrumb', async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  await vairifySummaryPage.setupPage()

  await vairifySummaryPage.clickButton('Kampala')
  await expect(
    vairifyCityPage.toolbarTextFinder('Cities/Kampala'),
  ).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Abu Dhabi')
  await expect(vairifyCityPage.textFinder('Cities/Abu Dhabi')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Zurich')
  await expect(vairifyCityPage.textFinder('Cities/Zurich')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')
})
