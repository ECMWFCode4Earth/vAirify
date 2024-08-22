import { Given, Then, When } from '@cucumber/cucumber'
// import { Browser, Page, chromium } from '@playwright/test'

// import { gotoPage } from '../../utils/helper_methods'

Given('the user navigates to the summary page', async function () {
  // const browser: Browser = await chromium.launch({ headless: false })
  // const page: Page = await browser.newPage()
  // await gotoPage(page, '/city/summary')
  console.log('test1')
})

When(
  'they change the forecast base time to {string} {string}',
  function (date, time) {
    console.log(date)
    console.log(time)
  },
)

When('they look at the entry in the table for {string}', function (city) {
  console.log(city)
})

Then(
  'the table data should be based on the data for {string} {string}, with forecast window {int}',
  function (date, time, forecast_window) {
    console.log(date)
    console.log(time)
    console.log(forecast_window)
  },
)
