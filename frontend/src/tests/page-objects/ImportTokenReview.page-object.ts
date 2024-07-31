import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CalloutWarningPo } from "$tests/page-objects/CalloutWarning.page-object";
import { ImportTokenCanisterIdPo } from "$tests/page-objects/ImportTokenCanisterId.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenReviewPo extends BasePageObject {
  private static readonly TID = "import-token-review-component";

  static under(element: PageObjectElement): ImportTokenReviewPo {
    return new ImportTokenReviewPo(element.byTestId(ImportTokenReviewPo.TID));
  }

  getLogoSource(): Promise<string> {
    return this.getElement("token-logo").getAttribute("src");
  }

  getTokenName(): Promise<string> {
    return this.getText("token-name");
  }

  getTokenSymbol(): Promise<string> {
    return this.getText("token-symbol");
  }

  getLedgerCanisterIdPo(): ImportTokenCanisterIdPo {
    return ImportTokenCanisterIdPo.under({
      element: this.root,
      testId: "ledger-canister-id",
    });
  }

  getIndexCanisterIdPo(): ImportTokenCanisterIdPo {
    return ImportTokenCanisterIdPo.under({
      element: this.root,
      testId: "index-canister-id",
    });
  }

  getWarningPo(): CalloutWarningPo {
    return CalloutWarningPo.under(this.root);
  }

  getBackButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "back-button",
    });
  }

  getConfirmButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "confirm-button",
    });
  }
}
