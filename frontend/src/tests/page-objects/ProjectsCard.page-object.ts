import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

class ProjectsCardRoPo extends BasePageObject {
  private static readonly TID = "card-row";

  static async allUnder(
    element: PageObjectElement
  ): Promise<ProjectsCardRoPo[]> {
    const rows = await element.allByTestId(ProjectsCardRoPo.TID);
    return rows.map((el) => new ProjectsCardRoPo(el));
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

  async getRows(): Promise<ProjectsCardRoPo[]> {
    return ProjectsCardRoPo.allUnder(this.root);
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
