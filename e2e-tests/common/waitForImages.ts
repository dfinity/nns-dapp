export const waitForImages = async (
  browser: WebdriverIO.Browser
): Promise<true | void> =>
  // Wait for all images to be "complete", i.e. loaded
  browser.waitUntil(
    function (): boolean {
      return this.execute(function () {
        const imgs: HTMLCollectionOf<HTMLImageElement> =
          document.getElementsByTagName("img");
        if (imgs.length <= 0) {
          return true;
        }

        const imagesReady: boolean = Array.prototype.every.call(imgs, (img) => {
          return img.complete;
        });
        const documentReady: boolean = document.readyState === "complete";
        const ready: boolean = imagesReady && documentReady;
        return ready;
      });
    },
    { timeoutMsg: "image wasn't loaded" }
  );
