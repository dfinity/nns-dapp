import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCWalletFooterPo extends BasePageObject {
  private static readonly TID = "ckbtc-wallet-footer-component";

  static under(element: PageObjectElement): CkBTCWalletFooterPo {
    return new CkBTCWalletFooterPo(element.byTestId(CkBTCWalletFooterPo.TID));
  }

  clickSendButton(): Promise<void> {
    return this.click("open-ckbtc-transaction");
  }

  clickReceiveButton(): Promise<void> {
    return this.click("receive-ckbtc");
  }
}
