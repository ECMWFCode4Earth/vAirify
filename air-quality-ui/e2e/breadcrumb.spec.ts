import { expect, test } from './fixtures'

test('Mocked response breadcrumb', async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  await vairifySummaryPage.setupPage()

  await vairifySummaryPage.clickButton('Kampala')
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.kampalaText).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Abu Dhabi')
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.abuDhabiText).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')

  await vairifySummaryPage.clickButton('Zurich')
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.zurichText).toBeVisible()
  await vairifySummaryPage.clickButton('Cities')
})
