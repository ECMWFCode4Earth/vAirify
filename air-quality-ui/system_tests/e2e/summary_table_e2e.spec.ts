import { test } from '../utils/fixtures'
import { gotoPage } from '../utils/helper_methods'
import { CaseAQI2, CaseAQI4 } from '../utils/test_enums'

test.beforeEach(async ({ page, summaryPage, banner }) => {
  // Navigate to the deployed UI and prepare the date with 21/08/2024 12:00
  await gotoPage(page, 'summary')
  await summaryPage.waitForLoad()
  await banner.setBaseTime('21/08/2024 12:00')
})
test('Changing the forecast base time on the summary page sets the correct data', async ({
  page,
  banner,
  summaryPage,
}) => {
  // Set date and filter by city 'Atlanta'
  await banner.clickUpdateButton()
  await summaryPage.waitForLoad()
  await summaryPage.filterByCity('Atlanta', page)

  //Compare the UI summary table data for Atlanta with expected verified data from the database
  const expectedTableContents: string[][] = [
    [
      // AQI Level
      CaseAQI4.aqiLevel.toString(), // Forecast
      CaseAQI2.aqiLevel.toString(), // Measured
      '+2', // Diff
      // pm2.5
      '10.2', // Forecast
      '8', // Measured
      '21 Aug 12:00', // Time
      // pm10
      '21.7', // Forecast
      '13.2', // Measured
      '22 Aug 00:00', // Time
      // no2
      '5', // Forecast
      '28.2', // Measured
      '21 Aug 12:00', // Time
      // o3
      '132.2', // Forecast
      '89.7', // Measured
      '21 Aug 21:00', // Time
      //so2
      '2.8', // Forecast
      '5.3', // Measured
      '21 Aug 12:00', // Time
    ],
  ]
  await summaryPage.assertGridAttributes('values', expectedTableContents)
})
