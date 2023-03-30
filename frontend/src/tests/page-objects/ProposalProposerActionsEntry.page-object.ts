import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { JsonPo } from "./Json.page-object";

export class ProposalProposerActionsEntryPo extends BasePageObject {
  static readonly tid = "proposal-proposer-actions-entry-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

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
