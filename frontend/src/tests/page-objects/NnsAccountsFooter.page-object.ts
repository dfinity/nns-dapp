import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAccountsFooterPo extends BasePageObject {
  private static readonly TID = "nns-accounts-footer-component";

  static under(element: PageObjectElement): NnsAccountsFooterPo {
    return new NnsAccountsFooterPo(element.byTestId(NnsAccountsFooterPo.TID));
  }

  getSendButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "open-new-transaction",
    });
  }

  async clickSend() {
    return this.getSendButtonPo().click();
  }
}
