import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsWalletPo } from "$tests/page-objects/NnsWallet.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class WalletPo extends BasePageObject {
  private static readonly TID = "wallet-component";

  static under(element: PageObjectElement): WalletPo {
    return new WalletPo(element.byTestId(WalletPo.TID));
  }

  getNnsWalletPo(): NnsWalletPo {
    return NnsWalletPo.under(this.root);
  }
}
