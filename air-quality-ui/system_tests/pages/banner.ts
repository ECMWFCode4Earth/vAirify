import { Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'

export class Banner extends BasePage {
  readonly page: Page

  readonly logo: Locator
  readonly dateOkButton: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.logo = page.getByAltText('vAirify')
    this.dateOkButton = page.getByRole('button', { name: 'Ok' })
  }

  async confirmDate() {
    await this.dateOkButton.click()
  }
}
