import { BasePageObject } from "$tests/page-objects/base.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ApyCardPo extends BasePageObject {
  private static readonly TID = "apy-card-component";

  static under(element: PageObjectElement): ApyCardPo {
    return new ApyCardPo(element.byTestId(ApyCardPo.TID));
  }

  getRewardAmount(): Promise<string> {
    return this.getText("reward");
  }

  getProjectionAmount(): Promise<string> {
    return this.getText("projection");
  }

  getStakingPowerPercentage(): Promise<string> {
    return this.getText("staking-power");
  }

  getLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
