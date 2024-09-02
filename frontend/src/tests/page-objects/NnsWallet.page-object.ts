import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { LinkToDashboardCanisterPo } from "$tests/page-objects/LinkToDashboardCanister.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { WalletMorePopoverPo } from "$tests/page-objects/WalletMorePopover.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { UiTransactionsListPo } from "./UiTransactionsList.page-object";

export class NnsWalletPo extends BasePageObject {
  private static readonly TID = "nns-wallet-component";

  static under(element: PageObjectElement): NnsWalletPo {
    return new NnsWalletPo(element.byTestId(NnsWalletPo.TID));
  }

  getWalletPageHeaderPo(): WalletPageHeaderPo {
    return WalletPageHeaderPo.under(this.root);
  }

  getWalletPageHeadingPo(): WalletPageHeadingPo {
    return WalletPageHeadingPo.under(this.root);
  }

  getIcpTransactionModalPo(): IcpTransactionModalPo {
    return IcpTransactionModalPo.under(this.root);
  }

  getUiTransactionsListPo(): UiTransactionsListPo {
    return UiTransactionsListPo.under(this.root);
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("new-transaction");
  }

  getReceiveButtonPo(): ButtonPo {
    return this.getButton("receive-icp");
  }

  getRenameButtonPo(): ButtonPo {
    return this.getButton("open-rename-subaccount-button");
  }

  getListNeuronsButtonPo(): ButtonPo {
    return this.getButton("ledger-list-button");
  }

  getShowHardwareWalletButtonPo(): ButtonPo {
    return this.getButton("ledger-show-button");
  }

  getMoreButton(): ButtonPo {
    return this.getButton("more-button");
  }

  getWalletMorePopoverPo(): WalletMorePopoverPo {
    return WalletMorePopoverPo.under(this.root);
  }

  getLinkToIndexCanisterPo(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({
      element: this.root,
      testId: "link-to-index-canister",
    });
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

  clickSend(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceive(): Promise<void> {
    return this.getReceiveButtonPo().click();
  }

  clickRename(): Promise<void> {
    return this.getRenameButtonPo().click();
  }

  hasMoreButton(): Promise<boolean> {
    return this.getMoreButton().isPresent();
  }

  clickMore(): Promise<void> {
    return this.getMoreButton().click();
  }

  async transferToAccount({
    accountName,
    expectedAccountAddress,
    amount,
  }: {
    accountName: string;
    expectedAccountAddress: string;
    amount: number;
  }): Promise<void> {
    await this.clickSend();
    const modal = this.getIcpTransactionModalPo();
    await modal.transferToAccount({
      accountName,
      expectedAccountAddress,
      amount,
    });
    await modal.waitForAbsent();
  }

  async transferToAddress({
    destinationAddress,
    amount,
  }: {
    destinationAddress: string;
    amount: number;
  }): Promise<void> {
    await this.clickSend();
    const modal = this.getIcpTransactionModalPo();
    await modal.transferToAddress({
      destinationAddress,
      amount,
    });
    await modal.waitForAbsent();
  }
}
