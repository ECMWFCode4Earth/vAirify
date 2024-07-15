import { expect, test } from "../utils/fixtures";

test("vAirify logo is visible", async ({ vairifyCityPage, banner }) => {
  await vairifyCityPage.gotoRioCityPage();
  await expect(banner.logo).toBeVisible();
});

test("AQI snapshot assertion", async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph();
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  const chartShot = await vairifyCityPage.captureAqiChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-aqi-graph.png");
});

test("pm2.5 snapshot", async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph();
  await vairifyCityPage.setBaseTime("01/07/2024 00:00");
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  const chartShot = await vairifyCityPage.capturePm2_5ChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-pm2_5-graph.png");
});

test("pm10 snapshot", async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph();
  await vairifyCityPage.setBaseTime("01/07/2024 00:00");
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  const chartShot = await vairifyCityPage.capturePm10ChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-pm10-graph.png");
});

test("o3 snapshot", async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph();
  await vairifyCityPage.setBaseTime("01/07/2024 00:00");
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  const chartShot = await vairifyCityPage.captureO3ChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-o3-graph.png");
});

test("no2 snapshot", async ({ vairifyCityPage }) => {
  await vairifyCityPage.setupCityPageGraph();
  await vairifyCityPage.setBaseTime("01/07/2024 00:00");
  await expect(vairifyCityPage.textFinder("Rio de Janeiro")).toBeVisible();
  const chartShot = await vairifyCityPage.captureNo2ChartScreenshot();
  expect(chartShot).toMatchSnapshot("rio-no2-graph.png");
});

test("Mocked response breadcrumb", async ({
  vairifySummaryPage,
  vairifyCityPage,
}) => {
  await vairifySummaryPage.setupPage();

  await vairifySummaryPage.clickButton("Kampala");
  await expect(
    vairifyCityPage.toolbarTextFinder("Cities/Kampala")
  ).toBeVisible();
  await vairifySummaryPage.clickButton("Cities");

  await vairifySummaryPage.clickButton("Abu Dhabi");
  await expect(vairifyCityPage.textFinder("Cities/Abu Dhabi")).toBeVisible();
  await vairifySummaryPage.clickButton("Cities");

  await vairifySummaryPage.clickButton("Zurich");
  await expect(vairifyCityPage.textFinder("Cities/Zurich")).toBeVisible();
  await vairifySummaryPage.clickButton("Cities");
});
