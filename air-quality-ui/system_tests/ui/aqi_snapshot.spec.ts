import { expect, test } from "../utils/fixtures";

test("AQI snapshot assertion", async ({ vairifyCityPage, page }) => {
  await vairifyCityPage.setupCityPageGraph();
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  await page.waitForTimeout(2000);
  const chartShot = await vairifyCityPage.captureChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-aqi-graph.png");
});
