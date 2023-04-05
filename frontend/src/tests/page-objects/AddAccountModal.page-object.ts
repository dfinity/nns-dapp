import { AddAccountTypePo } from "$tests/page-objects/AddAccountType.page-object";
import { AddSubAccountPo } from "$tests/page-objects/AddSubAccount.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddAccountModalPo extends BasePageObject {
  private static readonly TID = "add-account-modal-component";

  static under(element: PageObjectElement): AddAccountModalPo {
    return new AddAccountModalPo(element.byTestId(AddAccountModalPo.TID));
  }

  getAddAccountTypePo(): AddAccountTypePo {
    return AddAccountTypePo.under(this.root);
  }

  getAddSubAccountPo(): AddSubAccountPo {
    return AddSubAccountPo.under(this.root);
  }

  chooseLinkedAccount(): Promise<void> {
    return this.getAddAccountTypePo().chooseLinkedAccount();
  }

  enterAccountName(name: string): Promise<void> {
    return this.getAddSubAccountPo().enterAccountName(name);
  }

  clickCreate(): Promise<void> {
    return this.getAddSubAccountPo().clickCreate();
  }

  async addAccount(name: string): Promise<void> {
    await this.chooseLinkedAccount();
    await this.enterAccountName(name);
    await this.clickCreate();
  }

  waitForClosed(): Promise<void> {
    return this.root.waitForAbsent();
  }
}
