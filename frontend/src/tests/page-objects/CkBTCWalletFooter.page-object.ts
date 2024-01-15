import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCWalletFooterPo extends BasePageObject {
  private static readonly TID = "ckbtc-wallet-footer-component";

  static under(element: PageObjectElement): CkBTCWalletFooterPo {
    return new CkBTCWalletFooterPo(element.byTestId(CkBTCWalletFooterPo.TID));
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("open-ckbtc-transaction");
  }

  getReceiveButtonPo(): ButtonPo {
    return this.getButton("receive-ckbtc");
  }

  clickSendButton(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceiveButton(): Promise<void> {
    return this.getReceiveButtonPo().click();
  }
}
