import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CkBTCInfoCardPo } from "$tests/page-objects/CkBTCInfoCard.page-object";
import { CkBTCWalletFooterPo } from "$tests/page-objects/CkBTCWalletFooter.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { UiTransactionsListPo } from "$tests/page-objects/UiTransactionsList.page-object";
import { WalletMorePopoverPo } from "$tests/page-objects/WalletMorePopover.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CkBTCWalletPo extends BasePageObject {
  private static readonly TID = "ckbtc-wallet-component";

  static under(element: PageObjectElement): CkBTCWalletPo {
    return new CkBTCWalletPo(element.byTestId(CkBTCWalletPo.TID));
  }

  getUiTransactionsListPo(): UiTransactionsListPo {
    return UiTransactionsListPo.under(this.root);
  }

  getWalletPageHeaderPo(): WalletPageHeaderPo {
    return WalletPageHeaderPo.under(this.root);
  }

  getWalletPageHeadingPo(): WalletPageHeadingPo {
    return WalletPageHeadingPo.under(this.root);
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getCkBTCWalletFooterPo(): CkBTCWalletFooterPo {
    return CkBTCWalletFooterPo.under(this.root);
  }

  getMoreButton(): ButtonPo {
    return this.getButton("more-button");
  }

  getWalletMorePopover(): WalletMorePopoverPo {
    return WalletMorePopoverPo.under(this.root);
  }

  getCkBTCInfoCardPo(): CkBTCInfoCardPo {
    return CkBTCInfoCardPo.under(this.root);
  }

  hasSignInButton(): Promise<boolean> {
    return this.getSignInPo().isPresent();
  }

  clickRefreshBalance(): Promise<void> {
    return this.getCkBTCInfoCardPo().getUpdateBalanceButton().click();
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  hasNoTransactions(): Promise<boolean> {
    return this.isPresent("no-transactions-component");
  }
}
