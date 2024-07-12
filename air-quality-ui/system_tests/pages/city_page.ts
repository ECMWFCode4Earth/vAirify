import { type Locator, type Page } from "@playwright/test";

import { waitForIdleNetwork } from "../utils/helper_methods";

export class VairifyCityPage {
  readonly page: Page;
  readonly title: Locator;
  readonly scroller: Locator;
  readonly mockForecastObject: object;
  readonly mockMeasurementsObject: object;
  readonly aqiChart: Locator;
  readonly toolbarNavigation: Locator;
  readonly pm2_5Chart: Locator;
  readonly pm10Chart: Locator;
  readonly no2Chart: Locator;
  readonly o3Chart: Locator;

  constructor(
    page: Page,
    mockForecastObject: object,
    mockMeasurementsObject: object
  ) {
    this.page = page;
    this.pm2_5Chart = this.page.getByTestId("site_measurements_chart_pm2_5");
    this.pm10Chart = this.page.getByTestId("site_measurements_chart_pm10");
    this.no2Chart = this.page.getByTestId("site_measurements_chart_no2");
    this.o3Chart = this.page.getByTestId("site_measurements_chart_o3");
    this.title = this.page.locator("title");
    this.scroller = this.page.locator(".ag-body-horizontal-scroll-viewport");
    this.mockForecastObject = mockForecastObject;
    this.mockMeasurementsObject = mockMeasurementsObject;
    this.aqiChart = this.page
      .getByTestId("main-comparison-chart")
      .locator("canvas");
    this.toolbarNavigation = this.page.getByLabel(
      "Toolbar with site navigation"
    );
  }

  async captureAqiChartScreenshot() {
    await waitForIdleNetwork(
      this.page,
      this.aqiChart,
      this.pm2_5Chart,
      this.pm10Chart,
      this.no2Chart,
      this.o3Chart
    );
    return await this.aqiChart.screenshot();
  }

  async capturePm2_5ChartScreenshot() {
    await waitForIdleNetwork(
      this.page,
      this.aqiChart,
      this.pm2_5Chart,
      this.pm10Chart,
      this.no2Chart,
      this.o3Chart
    );
    return await this.pm2_5Chart.screenshot();
  }
  async capturePm10ChartScreenshot() {
    await waitForIdleNetwork(
      this.page,
      this.aqiChart,
      this.pm2_5Chart,
      this.pm10Chart,
      this.no2Chart,
      this.o3Chart
    );
    return await this.pm10Chart.screenshot();
  }
  async captureO3ChartScreenshot() {
    await waitForIdleNetwork(
      this.page,
      this.aqiChart,
      this.pm2_5Chart,
      this.pm10Chart,
      this.no2Chart,
      this.o3Chart
    );
    return await this.o3Chart.screenshot();
  }
  async captureNo2ChartScreenshot() {
    await waitForIdleNetwork(
      this.page,
      this.aqiChart,
      this.pm2_5Chart,
      this.pm10Chart,
      this.no2Chart,
      this.o3Chart
    );
    return await this.no2Chart.screenshot();
  }

  textFinder(textToFind: string) {
    return this.page.getByText(textToFind);
  }

  toolbarTextFinder(textToFind: string) {
    return this.toolbarNavigation.getByText(textToFind);
  }

  async setupRioDeJaneiroRoute() {
    await this.page.route("*/**/air-pollutant/forecast*", async (route) => {
      await route.fulfill({ json: this.mockForecastObject });
    });
    await this.page.route("*/**/air-pollutant/measurements*", async (route) => {
      await route.fulfill({ json: this.mockMeasurementsObject });
    });
  }

  async waitForAllGraphsToBeVisible() {
    await this.aqiChart.waitFor({ state: "visible" });
    await this.pm2_5Chart.waitFor({ state: "visible" });
    await this.pm10Chart.waitFor({ state: "visible" });
    await this.o3Chart.waitFor({ state: "visible" });
    await this.no2Chart.waitFor({ state: "visible" });
  }

  async gotoRioCityPage() {
    await this.page.goto("/city/Rio%20de%20Janeiro");
  }

  async setupCityPageGraph() {
    await this.setupRioDeJaneiroRoute();
    await this.gotoRioCityPage();
    await this.waitForAllGraphsToBeVisible();
  }
}
