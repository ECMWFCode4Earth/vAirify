import { expect, test } from '@playwright/test'

const correctLink = 'https://demo.playwright.dev/api-mocking'
const kiwiBananaImage = 'Kiwi-Banana.png'
const strawberryImage = 'Expected-fruit-strawberry.png'
test('Displays image check ', async ({ page }) => {
  //Api endpoint
  await page.route('*/**/api/v1/fruits', async (route) => {
    const json = [
      {
        name: 'Kiwi',
        id: 21,
      },
      {
        name: 'Banana',
        id: 21,
      },
    ]
    await route.fulfill({ json })
  })
  //Wait until the header is visible
  page.getByRole('heading', { name: 'Render a List of Fruits' }).isVisible
  await page.goto(correctLink)
  // Expect image to be visible

  //kiwiBananaImage will pass as it is what we have mocked as a response. StrawberryImage will not
  expect(await page.screenshot()).toMatchSnapshot(kiwiBananaImage)
  // Even though we are asserting something different it will still pass since it meets the minimum amount of similar pixels.
  //We can also do this with "maxDiffPixelRatio" , which works more as a minimum percentage
  expect(await page.screenshot()).toMatchSnapshot(strawberryImage, {
    maxDiffPixels: 11196,
  })
})
