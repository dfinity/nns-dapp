import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class TokensCardRowPo extends BasePageObject {
  private static readonly TID = "token-card-row";

  static async allUnder(
    element: PageObjectElement
  ): Promise<TokensCardRowPo[]> {
    const rows = await element.allByTestId(TokensCardRowPo.TID);
    return rows.map((el) => new TokensCardRowPo(el));
  }

  getTokenTitle(): Promise<string> {
    return this.getText("token-title");
  }

  getTokenNativeBalance(): Promise<string> {
    return this.getText("token-native-balance");
  }

  getTokenUsdBalance(): Promise<string> {
    return this.getText("token-usd-balance");
  }
}

export class TokensCardPo extends BasePageObject {
  private static readonly TID = "tokens-card";

  static under(element: PageObjectElement): TokensCardPo {
    return new TokensCardPo(element.byTestId(TokensCardPo.TID));
  }

  async getRows(): Promise<TokensCardRowPo[]> {
    return TokensCardRowPo.allUnder(this.root);
  }

  getAmount(): Promise<string> {
    return this.getText("amount");
  }

  getInfoRow(): PageObjectElement {
    return this.getElement("info-row");
  }

  async getTokensTitles(): Promise<string[]> {
    const rowsPos = await this.getRows();
    return Promise.all(rowsPos.map((po) => po.getTokenTitle()));
  }

  async getTokensUsdBalances(): Promise<string[]> {
    const rows = await this.getRows();

    return Promise.all(rows.map((row) => row.getTokenUsdBalance()));
  }

  async getTokensNativeBalances(): Promise<string[]> {
    const rows = await this.getRows();

    return Promise.all(rows.map((row) => row.getTokenNativeBalance()));
  }
}
