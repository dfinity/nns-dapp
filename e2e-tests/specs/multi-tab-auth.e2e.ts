import { register } from '../common/register';
import { logout } from '../common/logout';
import { loginWithIdentity } from '../common/login';
import { waitForImages } from '../common/waitForImages';
import { waitForLoad } from '../common/waitForLoad';

describe("landing page", () => {
  const nns_tabs = [];

  it("openTwoTabs", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    nns_tabs.push(await browser.getWindowHandle());
    //await browser.newWindow();
  });
});
