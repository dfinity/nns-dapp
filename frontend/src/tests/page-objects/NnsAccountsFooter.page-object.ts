import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAccountsFooterPo extends BasePageObject {
  static readonly tid = "nns-accounts-footer-component";

  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsAccountsFooterPo {
    return new NnsAccountsFooterPo(
      element.querySelector(`[data-tid=${NnsAccountsFooterPo.tid}]`)
    );
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
