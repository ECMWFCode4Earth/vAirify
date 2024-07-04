import { expect, test } from '../utils/fixtures'

test('Mocked response breadcrumb', async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  await vairifySummaryPage.setupPageWithMockData(
    vairifySummaryPage.mockedForecastResponse,
    vairifySummaryPage.mockedMeasurementSummaryResponse,
  )
  await vairifySummaryPage.clickButton('Kampala')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Kampala')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Abu Dhabi')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Abu Dhabi')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Zurich')
  await expect(vairifyCityPage.textFinder('Cities')).toBeVisible()
  await expect(vairifyCityPage.textFinder('Zurich')).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')
})
