import { AddAccountModalPo } from "$tests/page-objects/AddAccountModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAddAccountPo extends BasePageObject {
  private static readonly TID = "nns-add-account-component";

  static under(element: PageObjectElement): NnsAddAccountPo {
    return new NnsAddAccountPo(element.byTestId(NnsAddAccountPo.TID));
  }

  getAddAccountModalPo(): AddAccountModalPo {
    return AddAccountModalPo.under(this.root);
  }

  clickAddAccount(): Promise<void> {
    return this.getButton().click();
  }

  async addAccount(name: string): Promise<void> {
    await this.clickAddAccount();
    const modal = this.getAddAccountModalPo();
    await modal.addAccount(name);
    await modal.waitForClosed();
  }
}
