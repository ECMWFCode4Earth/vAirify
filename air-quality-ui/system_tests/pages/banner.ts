import { Locator, type Page } from '@playwright/test'

import { BasePage } from './base_page'

export class Banner extends BasePage {
  readonly page: Page

  readonly calendarIcon: Locator
  readonly dateOkButton: Locator
  readonly datePicker: Locator
  readonly datePickerNextMonthButton: Locator
  readonly datePickerTimeOptions: Locator
  readonly datePickerTimeOption0000: Locator
  readonly datePickerTimeOption1200: Locator
  readonly datePickerYearOpenButton: Locator
  readonly datePickerYearCloseButton: Locator
  readonly futureDay27: Locator
  readonly logo: Locator
  readonly windowDropdown: Locator
  readonly year2025: Locator

  constructor(page: Page) {
    super(page)
    this.page = page

    this.calendarIcon = page.getByTestId('CalendarIcon')
    this.dateOkButton = page.getByRole('button', { name: 'Ok' })
    this.datePicker = page.getByRole('textbox', { name: 'Forecast Base Date' })
    this.datePickerNextMonthButton = page.getByLabel('Next month')
    this.datePickerTimeOptions = page.locator('ul > [role="option"]')
    this.datePickerTimeOption0000 = page.getByRole('option', { name: '00:00' })
    this.datePickerTimeOption1200 = page.getByRole('option', { name: '12:00' })
    this.datePickerYearOpenButton = page.getByLabel(
      'calendar view is open, switch',
    )
    this.futureDay27 = page.locator(
      '//div[@aria-rowindex="4"] //button[@aria-colindex="6"]',
    )
    this.logo = page.getByAltText('vAirify')
    this.year2025 = page.locator('//div //button').filter({ hasText: /^2025$/ })
    this.windowDropdown = page.locator('svg').nth(1)
  }


  async forecastWindowDropdownClick(){
    await this.windowDropdown.click()
  }

  async forecastWindowDropdownSelect(option: string){
   const optionSelect = await this.page.getByRole('option', { name: option})
   await optionSelect.click()
  }
  

  async clickOnDay(day: number): Promise<void> {
    let row: number
    let column: number

    if (day >= 1 && day < 8) {
      row = 1
      column = day
    } else if (day >= 8 && day < 32) {
      row = Math.floor(day / 7 + 1)
      if (day % 7 == 0) {
        column = 7
      } else {
        column = day % 7
      }
    } else {
      throw new Error('Invalid day provided')
    }
    await this.page
      .locator(
        `//div[@aria-rowindex="${row}"] //button[@aria-colindex="${column}"]`,
      )
      .click()
  }

  async clickOnTime(time: string): Promise<void> {
    if (time == '00:00') {
      await this.datePickerTimeOption0000.click()
    } else if (time == '12:00') {
      await this.datePickerTimeOption1200.click()
    } else {
      throw new Error('Invalid time provided')
    }
  }

  async confirmDate() {
    await this.dateOkButton.click()
  }

  async setBaseTime(baseTime: string): Promise<void> {
    await this.datePicker.fill(baseTime)
  }
}
