import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { SnsTransactionModalPo } from "$tests/page-objects/SnsTransactionModal.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsWalletPo extends BasePageObject {
  private static readonly TID = "sns-wallet-component";

  static under(element: PageObjectElement): SnsWalletPo {
    return new SnsWalletPo(element.byTestId(SnsWalletPo.TID));
  }

  getWalletPageHeaderPo(): WalletPageHeaderPo {
    return WalletPageHeaderPo.under(this.root);
  }

  getWalletPageHeadingPo(): WalletPageHeadingPo {
    return WalletPageHeadingPo.under(this.root);
  }

  getIcrcTransactionsListPo(): IcrcTransactionsListPo {
    return IcrcTransactionsListPo.under(this.root);
  }

  getSnsTransactionModalPo(): SnsTransactionModalPo {
    return SnsTransactionModalPo.under(this.root);
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  clickSendButton(): Promise<void> {
    return this.click("open-new-sns-transaction");
  }

  clickReceiveButton(): Promise<void> {
    return this.click("receive-sns");
  }
}
