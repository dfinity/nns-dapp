import { CardFramePo } from "$tests/page-objects/CardFrame.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class OngoingProjectCardPo extends CardFramePo {
  private static readonly TID = "ongoing-project-card";

  static under(element: PageObjectElement): OngoingProjectCardPo {
    return new OngoingProjectCardPo(element.byTestId(OngoingProjectCardPo.TID));
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  getFundedOfMinValue(): Promise<string> {
    return this.getText("funded-of-min-value");
  }

  getMinIcpValue(): Promise<string> {
    return this.getText("min-icp-value");
  }

  getCapIcpValue(): Promise<string> {
    return this.getText("cap-icp-value");
  }

  getTimeRemaining(): Promise<string> {
    return this.getText("time-remaining");
  }

  getLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
