import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcWalletPo extends BasePageObject {
  private static readonly TID = "icrc-wallet-component";

  static under(element: PageObjectElement): IcrcWalletPo {
    return new IcrcWalletPo(element.byTestId(IcrcWalletPo.TID));
  }

  getIcrcTransactionsListPo(): IcrcTransactionsListPo {
    return IcrcTransactionsListPo.under(this.root);
  }

  getWalletPageHeaderPo(): WalletPageHeaderPo {
    return WalletPageHeaderPo.under(this.root);
  }

  getWalletPageHeadingPo(): WalletPageHeadingPo {
    return WalletPageHeadingPo.under(this.root);
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }
}
