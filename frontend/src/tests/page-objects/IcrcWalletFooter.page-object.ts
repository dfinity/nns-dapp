import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcWalletFooterPo extends BasePageObject {
  private static readonly TID = "icrc-wallet-footer-component";

  static under(element: PageObjectElement): IcrcWalletFooterPo {
    return new IcrcWalletFooterPo(element.byTestId(IcrcWalletFooterPo.TID));
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("open-new-icrc-token-transaction");
  }

  getReceiveButtonPo(): ButtonPo {
    return this.getButton("receive-icrc");
  }

  clickSendButton(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceiveButton(): Promise<void> {
    return this.getReceiveButtonPo().click();
  }
}
