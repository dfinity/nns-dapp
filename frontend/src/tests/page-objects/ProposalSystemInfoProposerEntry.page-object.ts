import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalSystemInfoProposerEntryPo extends BasePageObject {
  private static readonly TID = "proposal-system-info-proposer-entry-component";

  static under(element: PageObjectElement): ProposalSystemInfoProposerEntryPo {
    return new ProposalSystemInfoProposerEntryPo(
      element.byTestId(ProposalSystemInfoProposerEntryPo.TID)
    );
  }

  getNeuronId(): Promise<string> {
    return this.getText("proposal-system-info-proposer-value");
  }
}
