import { NnsAccountsPo } from "$tests/page-objects/NnsAccounts.page-object";
import { NnsAccountsFooterPo } from "$tests/page-objects/NnsAccountsFooter.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AddAccountModalPo } from "./AddAccountModal.page-object";
import { BuyICPModalPo } from "./BuyICPModal.page-object";
import { IcpTransactionModalPo } from "./IcpTransactionModal.page-object";
import { ReceiveModalPo } from "./ReceiveModal.page-object";

export class AccountsPo extends BasePageObject {
  private static readonly TID = "accounts-component";

  static under(element: PageObjectElement): AccountsPo {
    return new AccountsPo(element.byTestId(AccountsPo.TID));
  }

  getNnsAccountsPo(): NnsAccountsPo {
    return NnsAccountsPo.under(this.root);
  }

  getNnsAccountsFooterPo(): NnsAccountsFooterPo {
    return NnsAccountsFooterPo.under(this.root);
  }

  getBuyICPModalPo() {
    return BuyICPModalPo.under(this.root);
  }

  getAddAccountModalPo() {
    return AddAccountModalPo.under(this.root);
  }

  getIcpTransactionModalPo() {
    return IcpTransactionModalPo.under(this.root);
  }

  getReceiveModalPo() {
    return ReceiveModalPo.under(this.root);
  }

  clickSend(): Promise<void> {
    return this.getNnsAccountsFooterPo().clickSend();
  }

  clickBuyICP(): Promise<void> {
    return this.getNnsAccountsFooterPo().clickBuyICP();
  }

  async getAccountAddress(accountName: string): Promise<string> {
    const row = await this.getNnsAccountsPo()
      .getTokensTablePo()
      .getRowByName(accountName);
    await row.clickReceive();
    const receiveModalPo = this.getReceiveModalPo();
    await receiveModalPo.waitFor();
    const address = await receiveModalPo.getAddress();
    await receiveModalPo.closeModal();
    return address;
  }
}
