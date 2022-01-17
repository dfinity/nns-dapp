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

    const { remote } = require('webdriverio');

    ;(async () => {
        const browser = await remote({
            capabilities: {
                browserName: 'chrome'
            }
        })

        await browser.url('https://webdriver.io')

        const apiLink = await browser.$('=API')
        await apiLink.click()

        await browser.saveScreenshot('./screenshots/test.png')
        await browser.deleteSession()
    })()
}, 30_000);
