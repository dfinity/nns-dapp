import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";
import { AmountDisplayPo } from "./AmountDisplay.page-object";
import type { ButtonPo } from "./Button.page-object";
import { HashPo } from "./Hash.page-object";
import { LinkToDashboardCanisterPo } from "./LinkToDashboardCanister.page-object";
import { TooltipPo } from "./Tooltip.page-object";

export type TokensTableRowData = {
  projectName: string;
  balance: string;
};

export class TokensTableRowPo extends ResponsiveTableRowPo {
  static async allUnder(
    element: PageObjectElement
  ): Promise<TokensTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
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
        tid: ResponsiveTableRowPo.TID,
        count,
      })
      .map((el) => new TokensTableRowPo(el));
  }

  async getProjectName(): Promise<string> {
    const loadedProjectName = await this.getText("project-name");
    // Loaded or failed project name.
    return nonNullish(loadedProjectName)
      ? loadedProjectName.trim()
      : (await this.getFailedLedgerCanisterHashPo().getFullText())?.trim();
  }

  getBalance(): Promise<string> {
    return this.getText("token-value-label");
  }

  async getBalanceNumber(): Promise<number> {
    return Number(await AmountDisplayPo.under(this.root).getAmount());
  }

  hasUnavailableBalance(): Promise<boolean> {
    return this.root.byTestId("unavailable-balance").isPresent();
  }

  hasBalanceInUsd(): Promise<boolean> {
    return this.isPresent("usd-value");
  }

  getBalanceInUsd(): Promise<string> {
    return this.getText("usd-value");
  }

  getFailedLedgerCanisterHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getFailedTokenTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root.byTestId("failed-token-info"));
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

  getGoToDashboardButton(): LinkToDashboardCanisterPo {
    return LinkToDashboardCanisterPo.under({ element: this.root });
  }

  getRemoveActionButton(): ButtonPo {
    return this.getButton("remove-button-component");
  }

  hasGoToDetailIcon(): Promise<boolean> {
    return this.getGoToDetailIcon().isPresent();
  }

  hasImportedTokenTag(): Promise<boolean> {
    return this.root.byTestId("imported-token-tag").isPresent();
  }
}
