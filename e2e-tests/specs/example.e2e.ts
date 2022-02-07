describe("landing page", () => {
  it("loads", async () => {
    await browser.url("/v2/");

    await browser.$("h1").waitForExist();

    browser.waitUntil(
      function () {
        return this.execute(function () {
          let imgs = document.getElementsByTagName("img");
          if (imgs.length > 0) {
            return (
              Array.prototype.every.call(imgs, (img) => {
                return img.complete;
              }) && document.readyState === "complete"
            );
          } else {
            return true;
          }
        });
      },
      { timeoutMsg: `image wasn't loaded` }
    );

    await browser["screenshot"]("landing-page");
  });
});
