import { expect, test } from '../utils/fixtures'

test('vAirify logo is visible', async ({ cityPage, banner }) => {
  await cityPage.gotoRioCityPage()
  await expect(banner.logo).toBeVisible()
})

test('AQI snapshot assertion', async ({ cityPage }) => {
  await cityPage.setupCityPageGraph()
  await expect(cityPage.textFinder('Rio de Janeiro')).toBeVisible()
  const chartShot = await cityPage.captureAqiChartScreenshot()
  expect(chartShot).toMatchSnapshot('rio-aqi-graph.png')
})

test.describe('Pollutant graphs', () => {
  test.beforeEach(async ({ cityPage }) => {
    await cityPage.setupCityPageGraph()
    await cityPage.setBaseTime('01/07/2024 00:00')
  })

  test('pm2.5 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.capturePm2_5ChartScreenshot()
    expect(chartShot).toMatchSnapshot('rio-pm2_5-graph.png')
  })

  test('pm10 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.capturePm10ChartScreenshot()
    expect(chartShot).toMatchSnapshot('rio-pm10-graph.png')
  })

  test('o3 snapshot', async ({ cityPage, page }) => {
    const chartShot = await cityPage.captureO3ChartScreenshot()
    expect(chartShot).toMatchSnapshot('rio-o3-graph.png')
    await page.pause()
  })

  test('no2 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureNo2ChartScreenshot()
    expect(chartShot).toMatchSnapshot('rio-no2-graph.png')
  })

  test('o3 snapshot, no Copacabana and Centro', async ({ cityPage }) => {
    await cityPage.siteRemover('Copacabana')
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureO3ChartScreenshot()
    expect(chartShot).toMatchSnapshot(
      'rio-o3-graph-without-copacabana-centro.png',
    )
  })
})
