import { Capabilities } from "@wdio/types";

export function skipUnlessBrowserIs(compatibleBrowsers: Array<string>): void {
  if (
    !compatibleBrowsers.includes(
      (browser.capabilities as Capabilities.Capabilities).browserName ??
        "unknown"
    )
  )
    this.skip();
}
