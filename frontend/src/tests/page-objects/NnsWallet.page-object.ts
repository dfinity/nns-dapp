import { BasePageObject } from "$tests/page-objects/base.page-object";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { TransactionListPo } from "$tests/page-objects/TransactionList.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsWalletPo extends BasePageObject {
  private static readonly TID = "nns-wallet-component";

  static under(element: PageObjectElement): NnsWalletPo {
    return new NnsWalletPo(element.byTestId(NnsWalletPo.TID));
  }

  getIcpTransactionModalPo(): IcpTransactionModalPo {
    return IcpTransactionModalPo.under(this.root);
  }

  getTransactionListPo(): TransactionListPo {
    return TransactionListPo.under(this.root);
  }

  clickSend(): Promise<void> {
    return this.getButton("new-transaction").click();
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
