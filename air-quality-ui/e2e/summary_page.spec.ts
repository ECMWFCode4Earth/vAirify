import { expect, test } from "@playwright/test";

test("Title is vAirify", async ({ page }) => {
  await page.goto("http://localhost:5173/city/summary");
  const title = await page.title();
  expect(title).toBe("vAirify");
});

test("Experimental header visibility check", async ({ page }) => {
  await page.goto("http://localhost:5173/city/summary");

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

test("Mocked response breadcrumb", async ({ page }) => {
  await page.route("*/**/air-pollutant/forecast*", async (route) => {
    const json = [
      {
        base_time: "2024-06-19T00:00:00Z",
        valid_time: "2024-06-19T09:00:00Z",
        location_type: "city",
        location_name: "Kampala",
        overall_aqi_level: 2,
        no2: {
          aqi_level: 1,
          value: 0.3812829140487199,
        },
        o3: {
          aqi_level: 2,
          value: 72.9086035913633,
        },
        pm2_5: {
          aqi_level: 2,
          value: 16.067128848211063,
        },
        pm10: {
          aqi_level: 2,
          value: 26.087666551144732,
        },
        so2: {
          aqi_level: 1,
          value: 0.6314619719025142,
        },
      },
    ];
    await route.fulfill({ json });
  });

  await page.route(
    "*/**/air-pollutant/measurements/summary*",
    async (route) => {
      const json = [
        {
          measurement_base_time: "2024-06-19T09:00:00Z",
          location_type: "city",
          location_name: "Kampala",
          overall_aqi_level: {
            mean: 6,
          },
          pm2_5: {
            mean: {
              aqi_level: 6,
              value: 76,
            },
          },
        },
      ];
      await route.fulfill({ json });
    }
  );
  await page.goto("http://localhost:5173/city/summary");
  await page.getByRole("link", { name: "Kampala" }).click();
  await expect(page.locator("text=Cities")).toBeVisible();
  await expect(page.locator("text=Kampala")).toBeVisible();
});
