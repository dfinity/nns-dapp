import { BasePageObject } from "$tests/page-objects/base.page-object";
import { CkBTCWalletPo } from "$tests/page-objects/CkBTCWallet.page-object";
import { NnsWalletPo } from "$tests/page-objects/NnsWallet.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { IcrcTokenTransactionModalPo } from "./IcrcTokenTransactionModal.page-object";

export class WalletPo extends BasePageObject {
  private static readonly TID = "wallet-component";

  static under(element: PageObjectElement): WalletPo {
    return new WalletPo(element.byTestId(WalletPo.TID));
  }

  getNnsWalletPo(): NnsWalletPo {
    return NnsWalletPo.under(this.root);
  }

  getCkBTCWalletPo(): CkBTCWalletPo {
    return CkBTCWalletPo.under(this.root);
  }

  // TODO: GIX-2150 Use POs all the levels
  clickSendCkETH() {
    return this.click("open-new-icrc-token-transaction");
  }

  getIcrcTokenTransactionModalPo() {
    return IcrcTokenTransactionModalPo.under(this.root);
  }
}
