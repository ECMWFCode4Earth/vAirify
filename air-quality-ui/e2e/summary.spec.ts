import { expect, test } from "@playwright/test";
import { apiForecast, apiSummary } from "./mocked_api.ts";

test("Mocked response breadcrumb", async ({ page }) => {
  await page.route("*/**/air-pollutant/forecast*", async (route) => {
    await route.fulfill({ json: apiForecast });
  });
  await page.route(
    "*/**/air-pollutant/measurements/summary*",
    async (route) => {
      await route.fulfill({ json: apiSummary });
    }
  );
  await page.goto("http://localhost:5173/city/summary");
  await page.getByRole("link", { name: "Kampala" }).click();
  await expect(page.locator("text=Cities")).toBeVisible();
  await expect(page.locator("text=Kampala")).toBeVisible();
});
