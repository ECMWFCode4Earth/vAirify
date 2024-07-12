import { type Page } from '@playwright/test'

export class BasePage {
  readonly page: Page
  readonly baseAPIURL: string

  constructor(page: Page) {
    this.page = page
    this.baseAPIURL = 'http://localhost:8000/air-pollutant'
  }

  async getTitle() {
    const title = await this.page.title()
    return title
  }

  async clickButton(buttonName: string) {
    await this.page.getByRole('link', { name: buttonName }).click()
  }

  async setupApiRoute(endpoint: string, mockedAPIResponse: object) {
    await this.page.route(this.baseAPIURL + endpoint, async (route) => {
      await route.fulfill({ json: mockedAPIResponse })
    })
  }

  async captureNetworkRequestsAsArray(
    page: Page,
    expectedRequestMethod: string,
    expectedRequestEndpoint: string,
  ): Promise<string[]> {
    const requestArray: string[] = []
    page.on('request', (request) => {
      const requestUrl: string = request.url()
      if (
        request.method() === expectedRequestMethod &&
        requestUrl.includes(this.baseAPIURL + expectedRequestEndpoint)
      ) {
        requestArray.push(requestUrl)
      }
    })
    return requestArray
  }
}
