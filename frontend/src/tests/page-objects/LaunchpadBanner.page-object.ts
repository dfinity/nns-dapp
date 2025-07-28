import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LaunchpadBannerPo extends BasePageObject {
  private static readonly TID = "launchpad-banner-component";

  static under(element: PageObjectElement): LaunchpadBannerPo {
    return new LaunchpadBannerPo(element.byTestId(LaunchpadBannerPo.TID));
  }

  getContent(): PageObjectElement {
    return this.root.byTestId("content");
  }

  getRaisedValue(): Promise<string> {
    return this.getText("launchpad-banner-raised-value");
  }

  getLaunchedValue(): Promise<string> {
    return this.getText("launchpad-banner-launched-value");
  }

  getProposalsExecutedValue(): Promise<string> {
    return this.getText("launchpad-banner-proposals-executed-value");
  }
}
