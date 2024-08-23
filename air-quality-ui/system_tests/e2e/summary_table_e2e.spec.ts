import { test } from '../utils/fixtures'
import { gotoPage } from '../utils/helper_methods'
import { CaseAQI2, CaseAQI4 } from '../utils/test_enums'

test('Changing the forecast base time on the summary page sets the correct data', async ({
  page,
  banner,
  summaryPage,
}) => {
  // Given the user navigates to the summary page
  await gotoPage(page, 'summary')
  await summaryPage.waitForLoad()

  // When they change the forecast base time to "21/08/2024" "12:00"

  // await banner.calendarIcon.click()
  // await banner.findSpecificMonthAndYear('July', '2024'07)
  // await banner.clickOnDay(3)
  // await banner.datePickerTimeOption1200.click()
  // await banner.dateOkButton.click()

  await banner.setBaseTime('21/08/2024 12:00')
  await banner.dateOkButton.click()
  await summaryPage.waitForLoad()

  // And they look at the entry in the table for "Atlanta"
  await summaryPage.filterByCity('Atlanta')

  // Then the table data should be based on the data for "date" "time", with forecast window "1
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
  await summaryPage.waitForLoad()
  await summaryPage.assertGridAttributes('values', expectedTableContents)
})
