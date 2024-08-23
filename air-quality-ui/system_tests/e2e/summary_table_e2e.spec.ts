import { test } from '../utils/fixtures'
import { gotoPage } from '../utils/helper_methods'

test('Changing the forecast base time on the summary page sets the correct data', async ({
  page,
  banner,
  summaryPage,
}) => {
  // Given the user navigates to the summary page
  await gotoPage(page, 'summary')
  await summaryPage.waitForLoad()

  // When they change the forecast base time to "03/07/2024" "12:00"

  // await banner.calendarIcon.click()
  // await banner.findSpecificMonthAndYear('July', '2024'07)
  // await banner.clickOnDay(3)
  // await banner.datePickerTimeOption1200.click()
  // await banner.dateOkButton.click()

  await banner.setBaseTime('03/07/2024 12:00')
  await banner.dateOkButton.click()
  await summaryPage.waitForLoad()

  // And they look at the entry in the table for "London"
  await summaryPage.filterByCity('London')

  // Then the table data should be based on the data for "date" "time", with forecast window "1
  const expectedTableContents: string[][] = [
    [
      // AQI Level
      CaseAQI6.aqiLevel.toString(), // Forecast
      CaseAQI3.aqiLevel.toString(), // Measured
      '+3', // Diff
      // pm2.5
      CaseAQI6.pm2_5.toString(), // Forecast
      CaseAQI3.pm2_5.toString(), // Measured
      '08 Jul 06:00', // Time
      // pm10
      CaseAQI6.pm10.toString(), // Forecast
      CaseAQI3.pm10.toString(), // Measured
      '08 Jul 06:00', // Time
      // no2
      CaseAQI6.no2.toString(), // Forecast
      CaseAQI3.no2.toString(), // Measured
      '08 Jul 06:00', // Time
      // o3
      CaseAQI6.o3.toString(), // Forecast
      CaseAQI3.o3.toString(), // Measured
      '08 Jul 06:00', // Time
      //so2
      CaseAQI6.so2.toString(), // Forecast
      CaseAQI3.so2.toString(), // Measured
      '08 Jul 06:00', // Time
    ],
  ]
  await summaryPage.waitForLoad()
  await summaryPage.assertGridAttributes('values', expectedTableContents)
})
