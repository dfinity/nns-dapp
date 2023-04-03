import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TransactionModalPo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsWalletPo extends BasePageObject {
  private static readonly TID = "nns-wallet-component";

  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsWalletPo {
    return new NnsWalletPo(element.byTestId(NnsWalletPo.TID));
  }

  getTransactionModalPo(): TransactionModalPo {
    return TransactionModalPo.under(this.root);
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
    const modal = this.getTransactionModalPo();
    return modal.transferToAccount({
      accountName,
      expectedAccountAddress,
      amount,
    });
    await modal.waitForAbsent();
  }
}
