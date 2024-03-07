import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalsSegmentPo extends BasePageObject {
  private static readonly TID = "actionable-proposals-segment-component";

  static under(element: PageObjectElement): ActionableProposalsSegmentPo {
    return new ActionableProposalsSegmentPo(
      element.byTestId(ActionableProposalsSegmentPo.TID)
    );
  }

  getAllProposalsButtonPo(): PageObjectElement {
    return this.root.byTestId("all-proposals").querySelector("button");
  }

  getActionableProposalsButtonPo(): PageObjectElement {
    return this.root.byTestId("actionable-proposals").querySelector("button");
  }

  clickAllProposals(): Promise<void> {
    return this.getAllProposalsButtonPo().click();
  }

  clickActionableProposals(): Promise<void> {
    return this.getActionableProposalsButtonPo().click();
  }

  async isAllProposalsSelected(): Promise<boolean> {
    return (await this.getAllProposalsButtonPo().getClasses()).includes(
      "selected"
    );
  }

  async isActionableProposalsSelected(): Promise<boolean> {
    return (await this.getActionableProposalsButtonPo().getClasses()).includes(
      "selected"
    );
  }
}
