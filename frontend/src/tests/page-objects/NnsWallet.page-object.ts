import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { TransactionListPo } from "$tests/page-objects/TransactionList.page-object";
import { WalletPageHeaderPo } from "$tests/page-objects/WalletPageHeader.page-object";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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

  getTransactionListPo(): TransactionListPo {
    return TransactionListPo.under(this.root);
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("new-transaction");
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

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  clickSend(): Promise<void> {
    return this.getSendButtonPo().click();
  }

  clickReceive(): Promise<void> {
    return this.getButton("receive-icp").click();
  }

  clickRename(): Promise<void> {
    return this.getRenameButtonPo().click();
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
}
