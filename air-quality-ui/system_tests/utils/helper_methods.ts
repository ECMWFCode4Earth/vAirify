import { type Locator, type Page } from '@playwright/test'

export async function encodeDateToURIComponent(date: Date): Promise<string> {
  return encodeURIComponent(date.toISOString())
}

export async function gotoPage(page: Page, cityUrl: string): Promise<void> {
  await page.goto(cityUrl)
}

async function setupApiRoute(
  page: Page,
  endpointUrl: string,
  mockedAPIResponse: object,
): Promise<void> {
  await page.route(endpointUrl, async (route) => {
    await route.fulfill({ json: mockedAPIResponse })
  })
}

export async function setupPageWithMockData(
  page: Page,
  //Pass in target endpoint and mock reponse data
  mockResponseForEndpoint: {
    endpointUrl: string
    mockedAPIResponse: object
  }[],
): Promise<void> {
  for (const { endpointUrl, mockedAPIResponse } of mockResponseForEndpoint) {
    await setupApiRoute(page, endpointUrl, mockedAPIResponse)
  }
}

export async function waitForIdleNetwork(
  page: Page,
  chart: Locator,
): Promise<void> {
  try {
    await chart.waitFor()

    const idleTime = 1000
    const checkInterval = 200
    const timeout = 5000

    let lastActivityTime = Date.now()

    const checkNetworkIdle = async () => {
      while (Date.now() - lastActivityTime < idleTime) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval))
        const networkRequests = await page.evaluate(() => {
          return performance
            .getEntriesByType('resource')
            .filter((entry: PerformanceEntry) => {
              const resourceEntry = entry as PerformanceResourceTiming
              return (
                resourceEntry.initiatorType === 'xmlhttprequest' ||
                resourceEntry.initiatorType === 'fetch'
              )
            }).length
        })
        if (networkRequests === 0) {
          lastActivityTime = Date.now()
        }
      }
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network idle timeout')), timeout),
    )
    await Promise.race([checkNetworkIdle(), timeoutPromise])
  } catch (error) {
    console.error('Error waiting for chart animation:', error)
    throw error
  }
}
