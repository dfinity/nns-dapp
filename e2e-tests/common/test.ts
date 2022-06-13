import { Capabilities } from "@wdio/types";

/**
 * Some tests do not work (yet) on all browsers.  This method will skip the current
 * test on unsupported browsers.  Use of this method should generally be temporary.
 * All tests SHOULD work on all browsers we use in CI.
 */
export function skipUnlessBrowserIs(compatibleBrowsers: Array<string>): void {
  if (
    !compatibleBrowsers.includes(
      (browser.capabilities as Capabilities.Capabilities).browserName ??
        "unknown"
    )
  )
    this.skip();
}
