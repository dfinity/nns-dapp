import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalPayloadSectionPo extends BasePageObject {
  static readonly TID = "sns-proposal-payload-section-component";

  static under(element: PageObjectElement): SnsProposalPayloadSectionPo {
    return new SnsProposalPayloadSectionPo(
      element.byTestId(SnsProposalPayloadSectionPo.TID)
    );
  }

  getCardTitle(): Promise<string> {
    return this.root.querySelector("h2").getText();
  }

  getPayloadText(): Promise<string> {
    return this.root.byTestId("proposal-summary-component").getText();
  }
}
