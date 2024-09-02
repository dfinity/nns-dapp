import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { IcrcWalletFooterPo } from "$tests/page-objects/IcrcWalletFooter.page-object";
import { LinkToDashboardCanisterPo } from "$tests/page-objects/LinkToDashboardCanister.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { UiTransactionsListPo } from "$tests/page-objects/UiTransactionsList.page-object";
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

  getUiTransactionsListPo(): UiTransactionsListPo {
    return UiTransactionsListPo.under(this.root);
  }

  getIcrcWalletFooterPo(): IcrcWalletFooterPo {
    return IcrcWalletFooterPo.under(this.root);
  }

  getMoreButton(): ButtonPo {
    return this.getButton("more-button");
  }

  getLinkToLedgerCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
      testId: "link-to-ledger-canister",
    });
  }

  getLinkToIndexCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
      testId: "link-to-index-canister",
    });
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getSendButtonPo(): ButtonPo {
    return this.getIcrcWalletFooterPo().getSendButtonPo();
  }

  getReceiveButtonPo(): ButtonPo {
    return this.getIcrcWalletFooterPo().getReceiveButtonPo();
  }

  hasSignInButton(): Promise<boolean> {
    return this.getSignInPo().isPresent();
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  hasNoTransactions(): Promise<boolean> {
    return this.isPresent("no-transactions-component");
  }

  clickSendButton(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceiveButton(): Promise<void> {
    return this.getReceiveButtonPo().click();
  }
}
