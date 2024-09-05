import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { IcrcWalletFooterPo } from "$tests/page-objects/IcrcWalletFooter.page-object";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { WalletMorePopoverPo } from "$tests/page-objects/WalletMorePopover.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AddIndexCanisterModalPo } from "./AddIndexCanisterModal.page-object";

export class IcrcWalletPo extends BasePageObject {
  private static readonly TID = "icrc-wallet-component";

  static under(element: PageObjectElement): IcrcWalletPo {
    return new IcrcWalletPo(element.byTestId(IcrcWalletPo.TID));
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

  getWalletFooterPo(): IcrcWalletFooterPo {
    return IcrcWalletFooterPo.under(this.root);
  }

  getMoreButton(): ButtonPo {
    return this.getButton("more-button");
  }

  getAddIndexCanisterButtonPo(): ButtonPo {
    return this.getButton("add-index-canister-button");
  }

  getAddIndexCanisterModalPo(): AddIndexCanisterModalPo {
    return AddIndexCanisterModalPo.under(this.root);
  }

  getWalletMorePopoverPo(): WalletMorePopoverPo {
    return WalletMorePopoverPo.under(this.root);
  }

  getImportTokenRemoveConfirmationPo(): ImportTokenRemoveConfirmationPo {
    return ImportTokenRemoveConfirmationPo.under(this.root);
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
}
