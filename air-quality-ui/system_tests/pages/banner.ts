import { Locator, type Page } from '@playwright/test'

export class Banner {
  readonly page: Page
  readonly logo: Locator

  constructor(page: Page) {
    this.page = page
    this.logo = page.getByAltText('vAirify')
  }
}
