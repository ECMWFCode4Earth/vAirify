import { type Locator, type Page } from '@playwright/test'

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
