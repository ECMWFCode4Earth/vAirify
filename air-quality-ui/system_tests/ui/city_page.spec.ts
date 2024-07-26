import { expect, test } from '../utils/fixtures'
import {
  gotoPage,
  setupPageWithMockData,
  waitForIdleNetwork,
} from '../utils/helper_methods'
import {
  createForecastAPIResponseData,
  createMeasurementsCityPageResponseData,
} from '../utils/mocked_api'

test.use({
  viewport: { width: 1920, height: 1080 },
})
test('Legend deselect removes chosen site', async ({ page, cityPage }) => {
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
      overall_aqi_level: 4,
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
      site_name: 'Tijuca',
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Centro',
    }),
    createMeasurementsCityPageResponseData({
      site_name: 'Copacabana',
    }),
  ]
  await setupPageWithMockData(page, [
    {
      endpointUrl: '*/**/air-pollutant/forecast*',
      mockedAPIResponse: mockedForecastResponse,
    },
    {
      endpointUrl: '*/**/air-pollutant/measurements*',
      mockedAPIResponse: mockedMeasurementsCityPageResponse,
    },
  ])
  await gotoPage(page, '/city/Rio%20de%20Janeiro')
  await cityPage.waitForAllGraphsToBeVisible()

  await expect(cityPage.textFinder('Tijuca')).toBeVisible()
  await expect(cityPage.textFinder('Centro')).toBeVisible()
  await expect(cityPage.textFinder('Copacabana')).toBeVisible()
  await cityPage.siteRemover('Centro')
  await expect(cityPage.textFinder('Centro')).not.toBeVisible()
})

test.describe('City page resolution tests', () => {
  ;[
    {
      resolutionWidth: 960,
      resolutionHeight: 1080,
    },
    {
      resolutionWidth: 1366,
      resolutionHeight: 768,
    },
  ].forEach(({ resolutionWidth, resolutionHeight }) => {
    test.use({
      viewport: { width: resolutionWidth, height: resolutionHeight },
    })
    test(`Verify that the resolution (width: ${resolutionWidth} height: ${resolutionHeight}) does not affect the ability to view the charts`, async ({
      page,
      cityPage,
    }) => {
      const charts = [
        'aqiChart',
        'no2Chart',
        'pm2_5Chart',
        'o3Chart',
        'pm10Chart',
        'so2Chart',
      ]
      page.setViewportSize({ width: resolutionWidth, height: resolutionHeight })
      await gotoPage(page, 'city/Rio%20de%20Janeiro')
      await cityPage.waitForAllGraphsToBeVisible()
      for (let i = 0; i < charts.length; i++) {
        await cityPage[charts[i]].scrollIntoViewIfNeeded()
        expect(cityPage[charts[i]]).toBeInViewport({ ratio: 1 })
      }
    })
  })
})
test.use({
  viewport: { width: 1920, height: 1080 },
})
test.describe('City graph snapshots', () => {
  test.beforeEach(async ({ cityPage, page }) => {
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
        overall_aqi_level: 4,
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
        measurement_date: '2024-07-01T00:00:00Z',
        no2: 46,
        o3: 50,
        so2: 34,
        pm2_5: 10,
        pm10: 20,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T01:00:00Z',
        no2: 100,
        o3: 60,
        so2: 40,
        pm2_5: 20,
        pm10: 30,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T02:00:00Z',
        no2: 600,
        o3: 600,
        so2: 600,
        pm2_5: 600,
        pm10: 600,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T03:00:00Z',
        no2: 300,
        o3: 100,
        so2: 60,
        pm2_5: 50,
        pm10: 70,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T04:00:00Z',
        no2: 100,
        o3: 50,
        so2: 35,
        pm2_5: 30,
        pm10: 5,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T05:00:00Z',
        no2: 100,
        o3: 50,
        so2: 34,
        pm2_5: 10,
        pm10: 20,
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T06:00:00Z',
        no2: 100,
        o3: 50,
        so2: 34,
        pm2_5: 10,
        pm10: 20,
      }),
      //tijuca
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        no2: 100,
        o3: 50,
        so2: 34,
        pm2_5: 10,
        pm10: 20,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T01:00:00Z',
        no2: 150,
        o3: 100,
        so2: 70,
        pm2_5: 100,
        pm10: 100,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T02:00:00Z',
        no2: 130,
        o3: 100,
        so2: 70,
        pm2_5: 110,
        pm10: 50,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T03:00:00Z',
        no2: 300,
        o3: 200,
        so2: 50,
        pm2_5: 80,
        pm10: 20,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T04:00:00Z',
        no2: 130,
        o3: 100,
        so2: 70,
        pm2_5: 110,
        pm10: 50,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T05:00:00Z',
        no2: 200,
        o3: 120,
        so2: 80,
        pm2_5: 130,
        pm10: 70,
        site_name: 'Tijuca',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T06:00:00Z',
        no2: 200,
        o3: 120,
        so2: 80,
        pm2_5: 130,
        pm10: 70,
        site_name: 'Tijuca',
      }),

      //Copacabana
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T00:00:00Z',
        no2: 10,
        o3: 15,
        so2: 20,
        pm2_5: 30,
        pm10: 10,
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T01:00:00Z',
        no2: 15,
        o3: 20,
        so2: 30,
        pm2_5: 20,
        pm10: 20,
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T02:00:00Z',
        no2: 15,
        o3: 20,
        so2: 30,
        pm2_5: 20,
        pm10: 20,
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T03:00:00Z',
        no2: 300,
        o3: 30,
        so2: 40,
        pm2_5: 30,
        pm10: 30,
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T04:00:00Z',
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T05:00:00Z',
        no2: 15,
        o3: 20,
        so2: 30,
        pm2_5: 20,
        pm10: 20,
        site_name: 'Copacabana',
      }),
      createMeasurementsCityPageResponseData({
        measurement_date: '2024-07-01T06:00:00Z',
        no2: 100,
        o3: 200,
        so2: 100,
        pm2_5: 100,
        pm10: 100,
        site_name: 'Copacabana',
      }),
    ]

    await setupPageWithMockData(page, [
      {
        endpointUrl: '*/**/air-pollutant/forecast*',
        mockedAPIResponse: mockedForecastResponse,
      },
      {
        endpointUrl: '*/**/air-pollutant/measurements*',
        mockedAPIResponse: mockedMeasurementsCityPageResponse,
      },
    ])
    await gotoPage(page, '/city/Rio%20de%20Janeiro')
    await cityPage.waitForAllGraphsToBeVisible()
    await cityPage.setBaseTime('01/07/2024 00:00')
  })

  test('AQI snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.aqiChart)
    expect(chartShot).toMatchSnapshot('rio-aqi-graph.png')
  })

  test('pm2.5 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.pm2_5Chart)
    expect(chartShot).toMatchSnapshot('rio-pm2_5-graph.png')
  })

  test('pm10 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.pm10Chart)
    expect(chartShot).toMatchSnapshot('rio-pm10-graph.png')
  })

  test('o3 snapshot', async ({ cityPage, page }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.o3Chart)
    expect(chartShot).toMatchSnapshot('rio-o3-graph.png')
    await page.pause()
  })

  test('no2 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.no2Chart)
    expect(chartShot).toMatchSnapshot('rio-no2-graph.png')
  })
  test('so2 snapshot', async ({ cityPage }) => {
    const chartShot = await cityPage.captureChartScreenshot(cityPage.so2Chart)
    expect(chartShot).toMatchSnapshot('rio-so2-graph.png')
  })
  // remove station CENTRO
  test('Verify pm2.5 graph updates correctly when sites are removed', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.pm2_5Chart)
    expect(chartShot).toMatchSnapshot('rio-pm2.5-graph-without-centro.png')
  })
  test('Verify pm10 graph updates correctly when sites are removed', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.pm10Chart)
    expect(chartShot).toMatchSnapshot('rio-pm10-graph-without-centro.png')
  })
  test('Verify o3 graph updates correctly when sites are removed', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.o3Chart)
    expect(chartShot).toMatchSnapshot('rio-o3-graph-without-centro.png')
  })
  test('Verify no2 graph updates correctly when sites are removed', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.no2Chart)
    expect(chartShot).toMatchSnapshot('rio-no2-graph-without-centro.png')
  })
  test('Verify so2 graph updates correctly when sites are removed', async ({
    cityPage,
  }) => {
    await cityPage.siteRemover('Centro')
    const chartShot = await cityPage.captureChartScreenshot(cityPage.so2Chart)
    expect(chartShot).toMatchSnapshot('rio-so2-graph-without-centro.png')
  })
})

test.use({
  viewport: { width: 1920, height: 1080 },
})
test.describe('Charts are fully visible in 1920x1080 viewport', () => {
  test.beforeEach(async ({ page, cityPage }) => {
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
        overall_aqi_level: 4,
      }),
      createForecastAPIResponseData({
        base_time: '2024-07-01T00:00:00Z',
        valid_time: '2024-07-01T06:00:00Z',
        location_name: 'Rio de Janeiro',
        overall_aqi_level: 3,
      }),
    ]
    await setupPageWithMockData(page, [
      {
        endpointUrl: '*/**/air-pollutant/forecast*',
        mockedAPIResponse: mockedForecastResponse,
      },
    ])
    await gotoPage(page, '/city/Rio%20de%20Janeiro')

    await cityPage.waitForAllGraphsToBeVisible()
    await cityPage.setBaseTime('01/07/2024 00:00')
  })
  test('AQI chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.aqiChart)
    await expect(cityPage.aqiChart).toBeInViewport({ ratio: 1 })
  })
  test('pm2.5 chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.pm2_5Chart)

    await expect(cityPage.pm2_5Chart).toBeInViewport({ ratio: 1 })
  })
  test('pm10 chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.pm10Chart)
    await expect(cityPage.pm10Chart).toBeInViewport({ ratio: 1 })
  })
  test('o3 chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.o3Chart)
    await expect(cityPage.o3Chart).toBeInViewport({ ratio: 1 })
  })
  test('no2 chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.no2Chart)
    await expect(cityPage.no2Chart).toBeInViewport({ ratio: 1 })
  })
  test('so2 chart element is visible in fullscreen view', async ({
    cityPage,
    page,
  }) => {
    await waitForIdleNetwork(page, cityPage.so2Chart)
    await expect(cityPage.so2Chart).toBeInViewport({ ratio: 1 })
  })

  test.describe('No in-situ snapshots', () => {
    test('AQI snapshot without in-situ', async ({ cityPage }) => {
      const chartShot = await cityPage.captureChartScreenshot(cityPage.aqiChart)
      expect(chartShot).toMatchSnapshot('rio-aqi-no-insitu.png')
    })

    test('pm2.5 snapshot without in-situ', async ({ cityPage }) => {
      const chartShot = await cityPage.captureChartScreenshot(
        cityPage.pm2_5Chart,
      )
      expect(chartShot).toMatchSnapshot('rio-pm2_5-no-insitu.png')
    })

    test('pm10 snapshot without in-situ', async ({ cityPage }) => {
      const chartShot = await cityPage.captureChartScreenshot(
        cityPage.pm10Chart,
      )
      expect(chartShot).toMatchSnapshot('rio-pm10-no-insitu.png')
    })

    test('o3 snapshot without in-situ', async ({ cityPage, page }) => {
      const chartShot = await cityPage.captureChartScreenshot(cityPage.o3Chart)
      expect(chartShot).toMatchSnapshot('rio-o3-no-insitu.png')
      await page.pause()
    })

    test('no2 snapshot without in-situ', async ({ cityPage }) => {
      const chartShot = await cityPage.captureChartScreenshot(cityPage.no2Chart)
      expect(chartShot).toMatchSnapshot('rio-no2-no-insitu.png')
    })
    test('so2 snapshot without in-situ', async ({ cityPage }) => {
      const chartShot = await cityPage.captureChartScreenshot(cityPage.so2Chart)
      expect(chartShot).toMatchSnapshot('rio-so2-no-insitu.png')
    })
  })
})
