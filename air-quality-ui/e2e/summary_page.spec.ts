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
