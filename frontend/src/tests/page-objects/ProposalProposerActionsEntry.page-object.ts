import { BasePageObject } from "$tests/page-objects/base.page-object";
import { JsonPo } from "$tests/page-objects/Json.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalProposerActionsEntryPo extends BasePageObject {
  static readonly tid = "proposal-proposer-actions-entry-component";

  static under(element: PageObjectElement): ProposalProposerActionsEntryPo {
    return new ProposalProposerActionsEntryPo(
      element.byTestId(ProposalProposerActionsEntryPo.tid)
    );
  }

  getActionTitle(): Promise<string> {
    return this.root.querySelector("h2").getText();
  }

  getFieldsText(): Promise<string> {
    return this.root
      .byTestId("proposal-proposer-actions-entry-fields")
      .getText();
  }

  getJsonPos(): Promise<JsonPo[]> {
    return JsonPo.allUnder(this.root);
  }
}
