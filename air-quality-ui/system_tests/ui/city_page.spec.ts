import { expect, test } from '../utils/fixtures'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../utils/mocked_api'

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

test('TEST', async ({ cityPage, page }) => {
  const mockedForecastResponse = [
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T00:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 1,
    }),
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T03:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 2,
    }),
    createForecastAPIResponseData({
      base_time: '2024-07-01T00:00:00Z',
      valid_time: '2024-07-01T06:00:00Z',
      location_name: 'Rio de Janeiro',
      overall_aqi_level: 3,
    }),
  ]
  const mockedMeasurementsCityPageResponse = [
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T01:00:00Z',
      no2: 46,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T02:00:00Z',
      no2: 100,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T03:00:00Z',
      no2: 100,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T04:00:00Z',
      no2: 100,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T05:00:00Z',
      no2: 100,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T06:00:00Z',
      no2: 100,
    }),
    createMeasurementsCityPageResponseData({
      measurement_date: '2024-07-01T07:00:00Z',
      no2: 100,
    }),
  ]

  await cityPage.setupCityPageWithMockData(
    mockedForecastResponse,
    mockedMeasurementsCityPageResponse,
  )
  await page.waitForTimeout(5000)
  console.log(mockedMeasurementsCityPageResponse)
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
