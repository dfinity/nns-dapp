import { AccountCardPo } from "$tests/page-objects/AccountCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsAddAccountPo } from "$tests/page-objects/NnsAddAccount.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAccountsPo extends BasePageObject {
  static readonly tid = "accounts-body";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsAccountsPo {
    return new NnsAccountsPo(element.byTestId(NnsAccountsPo.tid));
  }

  getMainAccountCardPo(): AccountCardPo {
    // We assume the first card is the main card.
    return AccountCardPo.under(this.root);
  }

  getNnsAddAccountPo(): NnsAddAccountPo {
    return NnsAddAccountPo.under(this.root);
  }

  async addAccount(name: string): Promise<void> {
    await this.getNnsAddAccountPo().clickAddAccount();
    const modal = this.getNnsAddAccountPo().getAddAccountModalPo();
    await modal.getAddAccountTypePo().chooseLinkedAccount();
    await modal.getAddSubAccountPo().enterAccountName(name);
    await modal.getAddSubAccountPo().clickCreate();
    await modal.waitForClosed();
  }
}
