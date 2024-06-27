import { expect, test } from './fixtures'

test('Mocked response breadcrumb', async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  await vairifySummaryPage.setupPage()

  await vairifySummaryPage.kampalaBtn.click()
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.kampalaText).toBeVisible()
  await vairifySummaryPage.citiesBtn.click()

  await vairifySummaryPage.abuDhabiBtn.click()
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.abuDhabiText).toBeVisible()
  await vairifySummaryPage.citiesBtn.click()

  await vairifySummaryPage.zurichBtn.click()
  expect(vairifyCityPage.citiesBtn).toBeVisible
  expect(vairifyCityPage.zurichText).toBeVisible()
  await vairifySummaryPage.citiesBtn.click()
})
