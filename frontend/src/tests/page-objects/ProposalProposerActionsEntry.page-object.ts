import { JsonPreviewPo } from "$tests/page-objects/JsonPreview.page-object";
import { JsonRepresentationModeTogglePo } from "$tests/page-objects/JsonRepresentationModeToggle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
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

  getJsonRepresentationModeTogglePo(): JsonRepresentationModeTogglePo {
    return JsonRepresentationModeTogglePo.under(this.root);
  }

  getJsonPreviewPo(): JsonPreviewPo {
    return JsonPreviewPo.under(this.root);
  }
}
