import { expect, test } from "@playwright/test";
import { apiForecast, apiSummary } from "./mocked_api.ts";

test("Title is vAirify", async ({ page }) => {
  await page.goto("http://localhost:5173/city/summary");
  const title = await page.title();
  expect(title).toBe("vAirify");
});

test("Header visibility check", async ({ page }) => {
  await page.goto("/city/summary");

  const headers = [
    { name: "AQI Level", visible: true },
    { name: "PM 2.5 (µg/m³)", visible: true },
    { name: "PM 10 (µg/m³)", visible: true },
    { name: "Nitrogen Dioxide (µg/m³)", visible: true },
    { name: "Ozone (µg/m³)", visible: true },
    { name: "Sulphur Dioxide (µg/m³)", visible: true },
  ];

  for (const { name, visible } of headers) {
    const header = page.getByRole("columnheader", { name });

    const isVisible = await header.isVisible();
    console.log(`Header "${name}" is ${isVisible ? "visible" : "hidden"}`);

    if (visible) {
      await expect(header).toBeVisible();
    } else {
      await expect(header).toBeHidden();
    }
  }
});

test("Header text check", async ({ page }) => {
  await page.goto("/city/summary");

  const checkColumnHeaderText = async (name, expectedText) => {
    const header = page.getByRole("columnheader", { name });
    await header.waitFor({ state: "visible" });
    await expect(header).toHaveText(expectedText);
  };

  await checkColumnHeaderText("AQI Level", "AQI Level");
  await checkColumnHeaderText("PM 2.5 (µg/m³)", "PM 2.5 (µg/m³)");
  await checkColumnHeaderText("PM 10 (µg/m³)", "PM 10 (µg/m³)");
  await checkColumnHeaderText(
    "Nitrogen Dioxide (µg/m³)",
    "Nitrogen Dioxide (µg/m³)"
  );
  await checkColumnHeaderText("Ozone (µg/m³)", "Ozone (µg/m³)");
  await checkColumnHeaderText(
    "Sulphur Dioxide (µg/m³)",
    "Sulphur Dioxide (µg/m³)"
  );
});


