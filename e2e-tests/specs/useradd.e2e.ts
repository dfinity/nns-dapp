/**
 * Creates a standard set of users.
 */
const { register } = require("../common/register");
const { waitForImages } = require("../common/waitForImages");
const { waitForLoad } = require("../common/waitForLoad");
const { Header } = require("../components/header");

describe("", () => {
  it("create_User_1", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${userId}`);
    // Get ICP
await browser.execute(() => {
  window.onerror = function (errorMsg, url, lineNumber) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
  }
});


    await new Header(browser).getIcp(100);
    // Create a neuron
  });
});
