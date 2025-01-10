import { CkBTCWalletPo } from "$tests/page-objects/CkBTCWallet.page-object";
import { IcrcTokenTransactionModalPo } from "$tests/page-objects/IcrcTokenTransactionModal.page-object";
import { IcrcWalletPo } from "$tests/page-objects/IcrcWallet.page-object";
import { NnsWalletPo } from "$tests/page-objects/NnsWallet.page-object";
import { SnsWalletPo } from "$tests/page-objects/SnsWallet.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class WalletPo extends BasePageObject {
  private static readonly TID = "wallet-component";

  static under(element: PageObjectElement): WalletPo {
    return new WalletPo(element.byTestId(WalletPo.TID));
  }

  getNnsWalletPo(): NnsWalletPo {
    return NnsWalletPo.under(this.root);
  }

  getSnsWalletPo(): SnsWalletPo {
    return SnsWalletPo.under(this.root);
  }

  getCkBTCWalletPo(): CkBTCWalletPo {
    return CkBTCWalletPo.under(this.root);
  }

  getIcrcWalletPo() {
    return IcrcWalletPo.under(this.root);
  }

  // TODO: GIX-2150 Use POs all the levels
  clickSendCkETH() {
    return this.click("open-new-icrc-token-transaction");
  }

  getIcrcTokenTransactionModalPo() {
    return IcrcTokenTransactionModalPo.under(this.root);
  }
}
