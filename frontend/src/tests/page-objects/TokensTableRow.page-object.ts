import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export type TokensTableRowData = {
  projectName: string;
  balance: string;
};

export class TokensTableRowPo extends BasePageObject {
  private static readonly TID = "tokens-table-row-component";

  static async allUnder(
    element: PageObjectElement
  ): Promise<TokensTableRowPo[]> {
    return Array.from(await element.allByTestId(TokensTableRowPo.TID)).map(
      (el) => new TokensTableRowPo(el)
    );
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }

  getBalance(): Promise<string> {
    return this.getText("token-value-label");
  }

  hasBalanceSpinner(): Promise<boolean> {
    const balanceElement = this.root.byTestId("token-value-label");
    return balanceElement.byTestId("spinner").isPresent();
  }

  getSubtitle(): Promise<string | null> {
    return this.getText("project-subtitle");
  }

  async getData(): Promise<TokensTableRowData> {
    const projectName = await this.getProjectName();
    const balance = await this.getBalance();
    return { projectName, balance };
  }

  getSendButton(): PageObjectElement {
    return this.root.byTestId("send-button-component");
  }

  hasSendButton(): Promise<boolean> {
    return this.getSendButton().isPresent();
  }

  clickSend(): Promise<void> {
    return this.getSendButton().click();
  }

  getReceiveButton(): PageObjectElement {
    return this.root.byTestId("receive-button-component");
  }

  hasReceiveButton(): Promise<boolean> {
    return this.getReceiveButton().isPresent();
  }

  clickReceive(): Promise<void> {
    return this.getReceiveButton().click();
  }

  getGoToDetailButton(): PageObjectElement {
    return this.root.byTestId("go-to-detail-button-component");
  }

  hasGoToDetailButton(): Promise<boolean> {
    return this.getGoToDetailButton().isPresent();
  }

  clickGoToDetail(): Promise<void> {
    return this.getGoToDetailButton().click();
  }
}
