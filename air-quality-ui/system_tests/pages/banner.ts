import { Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'

export class Banner extends BasePage {
  readonly page: Page

  readonly calendarIcon: Locator
  readonly datePicker: Locator
  readonly logo: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.calendarIcon = page.getByTestId('CalendarIcon')
    this.datePicker = page.getByRole('textbox', { name: 'Forecast Base Date' })
    this.logo = page.getByAltText('vAirify')
  }

  async clickOnDay(day: number): Promise<void> {
    let row: number
    let column: number

    if (day >= 1 && day < 8) {
      row = 1
      column = day
    } else if (day >= 8 && day < 32) {
      row = Math.floor(day / 7)
      if (day % 7 == 0) {
        column = 7
      } else {
        column = day % 7
      }
    } else {
      throw new Error('invalid day')
    }
    await this.page
      .locator(
        `//div[@aria-rowindex="${row}"] //button[@aria-colindex="${column}"]`,
      )
      .click()
  }
  async setBaseTime(baseTime: string): Promise<void> {
    await this.datePicker.fill(baseTime)
  }
}
