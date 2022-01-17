import { LoginView } from "./views";
import {
  Screenshots,
  runInBrowser,
  waitForFonts,
  setupSeleniumServer,
  RunConfiguration,
} from "./util";
import { remote } from "webdriverio";

setupSeleniumServer();

test("Screenshots", async () => {
  await runInBrowser(
    async (browser: any, runConfig: RunConfiguration) => {
      const screenshots = new Screenshots(
        "screenshots/",
        runConfig.screenConfiguration.screenType
      );

      await browser.url("http://localhost:8086/v2/index.html");

      await waitForFonts(browser);
      const loginView = new LoginView(browser);
      await loginView.waitForDisplay();
      await screenshots.take("login", browser);
    }
  );
}, 30_000);
