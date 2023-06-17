import { AccountCardPo } from "$tests/page-objects/AccountCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class BaseAccountsPo extends BasePageObject {
  getMainAccountCardPo(): AccountCardPo {
    // We assume the first card is the main card.
    return AccountCardPo.under(this.root);
  }

  getAccountCardPos(): Promise<AccountCardPo[]> {
    return AccountCardPo.allUnder(this.root);
  }

  async getAccountCardPo(accountName: string): Promise<AccountCardPo> {
    const cards = await this.getAccountCardPos();
    const names = await Promise.all(cards.map((card) => card.getAccountName()));
    const index = names.indexOf(accountName);
    if (index === -1) {
      throw new Error(
        `Account ${accountName} not found. Available accounts are ${names}`
      );
    }
    return cards[index];
  }

  async openAccount(accountName: string): Promise<void> {
    return (await this.getAccountCardPo(accountName)).click();
  }

  async getAccountNames(): Promise<string[]> {
    const cards = await this.getAccountCardPos();
    return Promise.all(cards.map((card) => card.getAccountName()));
  }

  async getAccountAddress(accountName: string): Promise<string> {
    const card = await this.getAccountCardPo(accountName);
    return card.getAccountAddress();
  }

  async getAccountBalance(accountName: string): Promise<string> {
    const card = await this.getAccountCardPo(accountName);
    return card.getBalance();
  }
}
