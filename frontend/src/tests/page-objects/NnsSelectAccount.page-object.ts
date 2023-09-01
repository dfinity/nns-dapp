import { AccountCardPo } from "$tests/page-objects/AccountCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsSelectAccountPo extends BasePageObject {
  private static readonly TID = "select-account-screen";

  static under(element: PageObjectElement): NnsSelectAccountPo {
    return new NnsSelectAccountPo(element.byTestId(NnsSelectAccountPo.TID));
  }

  getAccountCardPos(): Promise<AccountCardPo[]> {
    return AccountCardPo.allUnder(this.root);
  }

  async getAccountCardPoForIdentifier(
    identifier: string
  ): Promise<AccountCardPo> {
    const accountCards = await this.getAccountCardPos();
    for (const accountCard of accountCards) {
      if ((await accountCard.getIdentifier()) === identifier) {
        return accountCard;
      }
    }
    throw new Error(`Account card with identifier ${identifier} not found`);
  }

  getMainAccountCardPo(): AccountCardPo {
    // There might be multiple cards but the first one should be the main account.
    return AccountCardPo.under(this.root);
  }

  async selectMainAccount(): Promise<void> {
    await this.getMainAccountCardPo().waitFor();
    await this.getMainAccountCardPo().click();
  }
}
