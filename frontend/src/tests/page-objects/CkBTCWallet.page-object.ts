import { BasePageObject } from "$tests/page-objects/base.page-object";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCWalletPo extends BasePageObject {
  private static readonly TID = "ckbtc-wallet-component";

  static under(element: PageObjectElement): CkBTCWalletPo {
    return new CkBTCWalletPo(element.byTestId(CkBTCWalletPo.TID));
  }

  getIcrcTransactionsListPo(): IcrcTransactionsListPo {
    return IcrcTransactionsListPo.under(this.root);
  }

  clickRefreshBalance(): Promise<void> {
    return this.click("manual-refresh-balance");
  }
}
