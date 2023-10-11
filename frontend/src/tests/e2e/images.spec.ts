import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const expectImagesLoaded = async ({ page, sources }) => {
  const images = page.locator("img");
  const imageSources = await Promise.all(
    (await images.all()).map((img) => img.getAttribute("src"))
  );
  // We only look at the basename (stripping path and content hash extension)
  // because the rest might differ depending on the environment.
  const baseImageSources = imageSources.map((src) =>
    src.replace(/.*\//, "").replace(/\.[0-9a-f]{8}\./, ".")
  );
  baseImageSources.sort();
  expect(baseImageSources).toEqual(sources);

  await page.waitForFunction(
    async (expectedImageCount) => {
      const images = Array.from(document.querySelectorAll("img"));
      if (images.length !== expectedImageCount) {
        return false;
      }
      // The browser might decide not to load images that are outside the
      // viewport.
      for (const img of images) {
        img.scrollIntoView();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return images.every((img) => img.complete);
    },
    sources.length,
    { timeout: 10000 }
  );
};

test.describe.configure({ retries: 2 });

test("Test images load on accounts page", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My Tokens / NNS Dapp");

  await step("Check images before signing");
  await expectImagesLoaded({
    page,
    sources: [
      "icp-rounded.svg",
      "icp-rounded.svg",
      "logo-nns.svg",
      "logo-onchain-light.svg",
      "menu-bg-light.png",
    ],
  });

  await signInWithNewUser({ page, context });

  await step("Check images after signing");

  // Open Snses list
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  await appPo.openUniverses();

  await expectImagesLoaded({
    page,
    sources: [
      // Universe selector in main layout
      "ckBTC.svg",
      // Universe selector in main layout
      "icp-rounded.svg",
      // Hidden title in main layout
      "icp-rounded.svg",
      // ICP universe card in the universes selector modal
      "icp-rounded.svg",
      // Menu
      "logo-nns.svg",
      "logo-onchain-light.svg",
      // logo.png are for all the different SNSes and are loaded from the
      // aggregator:
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      "logo.png",
      // Menu background
      "menu-bg-light.png",
    ],
  });
});
