import { type Locator, type Page } from '@playwright/test'

export class VairifyCityPage {
  readonly page: Page
  readonly apiForecast: object
  readonly apiSummary: object
  readonly title: Locator
  readonly scroller: Locator
  readonly citiesBtn: Locator
  readonly kampalaText: Locator
  readonly abuDhabiText: Locator
  readonly zurichText: Locator

  constructor(page: Page) {
    this.page = page
    this.title = this.page.locator('title')
    this.scroller = this.page.locator('.ag-body-horizontal-scroll-viewport')
    this.citiesBtn = this.page.getByRole('link', { name: 'Cities' })
    this.kampalaText = this.page.locator('text=Kampala')
    this.abuDhabiText = this.page.locator('text=Abu Dhabi')
    this.zurichText = this.page.locator('text=Kampala')
  }
}
