import type { PageObjectElement } from "$tests/types/page-object.types";
import { AmountDisplayPo } from "./AmountDisplay.page-object";
import { BasePageObject } from "./base.page-object";

export type TokensTableRowData = {
  projectName: string;
  balance: string;
};

export class TokensTableRowPo extends BasePageObject {
  private static readonly TID = "responsive-table-row-component";

  static async allUnder(
    element: PageObjectElement
  ): Promise<TokensTableRowPo[]> {
    return Array.from(await element.allByTestId(TokensTableRowPo.TID)).map(
      (el) => new TokensTableRowPo(el)
    );
  }

  static byTitle({
    element,
    title,
  }: {
    element: PageObjectElement;
    title: string;
  }): TokensTableRowPo {
    return new TokensTableRowPo(
      element.querySelector(`[data-title="${title}"]`)
    );
  }

  static countUnder({
    element,
    count,
  }: {
    element: PageObjectElement;
    count?: number | undefined;
  }): TokensTableRowPo[] {
    return element
      .countByTestId({
        tid: TokensTableRowPo.TID,
        count,
      })
      .map((el) => new TokensTableRowPo(el));
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }

  getBalance(): Promise<string> {
    return this.getText("token-value-label");
  }

  async getBalanceNumber(): Promise<number> {
    return Number(await AmountDisplayPo.under(this.root).getAmount());
  }

  async waitForBalance(): Promise<void> {
    await this.root.byTestId("token-value-label").waitFor();
    await this.root
      .byTestId("token-value-label")
      .byTestId("spinner")
      .waitForAbsent();
  }

  hasBalanceSpinner(): Promise<boolean> {
    const balanceElement = this.root.byTestId("token-value-label");
    return balanceElement.byTestId("spinner").isPresent();
  }

  getHref(): Promise<string | null> {
    return this.root.getAttribute("href");
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

  async click(testId?: string): Promise<void> {
    await this.waitForBalance();
    return super.click(testId);
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

  getGoToDetailIcon(): PageObjectElement {
    return this.root.byTestId("go-to-detail-icon-component");
  }

  hasGoToDetailIcon(): Promise<boolean> {
    return this.getGoToDetailIcon().isPresent();
  }
}
