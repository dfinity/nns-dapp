import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcWalletFooterPo extends BasePageObject {
  private static readonly TID = "icrc-wallet-footer-component";

  static under(element: PageObjectElement): IcrcWalletFooterPo {
    return new IcrcWalletFooterPo(element.byTestId(IcrcWalletFooterPo.TID));
  }

  clickSendButton(): Promise<void> {
    return this.click("open-new-icrc-token-transactionn");
  }

  clickReceiveButton(): Promise<void> {
    return this.click("receive-icrc");
  }
}
