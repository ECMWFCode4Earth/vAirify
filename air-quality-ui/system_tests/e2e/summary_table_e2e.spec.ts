import { expect, test } from '../utils/fixtures'
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
})
