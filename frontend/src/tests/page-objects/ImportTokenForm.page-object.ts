import { BannerPo } from "$tests/page-objects/Banner.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CalloutWarningPo } from "$tests/page-objects/CalloutWarning.page-object";
import { ImportTokenCanisterIdPo } from "$tests/page-objects/ImportTokenCanisterId.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ImportTokenFormPo extends BasePageObject {
  private static readonly TID = "import-token-form-component";

  static under(element: PageObjectElement): ImportTokenFormPo {
    return new ImportTokenFormPo(element.byTestId(ImportTokenFormPo.TID));
  }

  getLedgerCanisterInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "ledger-canister-id",
    });
  }

  getLedgerCanisterIdPo(): ImportTokenCanisterIdPo {
    return ImportTokenCanisterIdPo.under({
      element: this.root,
      testId: "ledger-canister-id-view",
    });
  }

  getIndexCanisterInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "index-canister-id",
    });
  }

  getWarningPo(): CalloutWarningPo {
    return CalloutWarningPo.under(this.root);
  }

  getCancelButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "cancel-button",
    });
  }

  getSubmitButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "submit-button",
    });
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getSignBannerPo(): SignInPo {
    return BannerPo.under(this.root);
  }
}
