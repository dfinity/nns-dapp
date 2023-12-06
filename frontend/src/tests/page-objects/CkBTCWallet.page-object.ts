import { CkBTCInfoCardPo } from "$tests/page-objects/CkBTCInfoCard.page-object";
import { CkBTCWalletFooterPo } from "$tests/page-objects/CkBTCWalletFooter.page-object";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCWalletPo extends BasePageObject {
  private static readonly TID = "ckbtc-wallet-component";

  static under(element: PageObjectElement): CkBTCWalletPo {
    return new CkBTCWalletPo(element.byTestId(CkBTCWalletPo.TID));
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

  getCkBTCWalletFooterPo(): CkBTCWalletFooterPo {
    return CkBTCWalletFooterPo.under(this.root);
  }

  getCkBTCInfoCardPo(): CkBTCInfoCardPo {
    return CkBTCInfoCardPo.under(this.root);
  }

  clickRefreshBalance(): Promise<void> {
    return this.getCkBTCInfoCardPo().getUpdateBalanceButton().click();
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }
}
