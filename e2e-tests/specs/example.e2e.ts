describe("landing page", () => {
  it("loads", async () => {
    await browser.url("/v2/");

    await browser.$("h1").waitForExist();

    await browser["screenshot"]("landing-page");
  });
});
