import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class HeldTokensCardRowPo extends BasePageObject {
  private static readonly TID = "held-token-card-row";

  static async allUnder(
    element: PageObjectElement
  ): Promise<HeldTokensCardRowPo[]> {
    const rows = await element.allByTestId(HeldTokensCardRowPo.TID);
    return rows.map((el) => new HeldTokensCardRowPo(el));
  }

  getRowTag(): Promise<string> {
    return this.root.getTagName();
  }

  getHeldTokenTitle(): Promise<string> {
    return this.getText("title");
  }

  getHeldTokenBalanceInNativeCurrency(): Promise<string> {
    return this.getText("balance-in-native");
  }

  getHeldTokenBalanceInUsd(): Promise<string> {
    return this.getText("balance-in-usd");
  }
}

export class HeldTokensCardPo extends BasePageObject {
  private static readonly TID = "held-tokens-card";

  static under(element: PageObjectElement): HeldTokensCardPo {
    return new HeldTokensCardPo(element.byTestId(HeldTokensCardPo.TID));
  }

  async getRows(): Promise<HeldTokensCardRowPo[]> {
    return HeldTokensCardRowPo.allUnder(this.root);
  }

  getAmount(): Promise<string> {
    return this.getText("amount");
  }

  getInfoRow(): PageObjectElement {
    return this.getElement("info-row");
  }

  async getHeldTokensTitles(): Promise<string[]> {
    const rowsPos = await this.getRows();
    return Promise.all(rowsPos.map((po) => po.getHeldTokenTitle()));
  }

  async getHeldTokensBalanceInUsd(): Promise<string[]> {
    const rows = await this.getRows();

    return Promise.all(rows.map((row) => row.getHeldTokenBalanceInUsd()));
  }

  async getHeldTokensBalanceInNativeCurrency(): Promise<string[]> {
    const rows = await this.getRows();

    return Promise.all(
      rows.map((row) => row.getHeldTokenBalanceInNativeCurrency())
    );
  }

  async getRowsTags(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getRowTag()));
  }
}
