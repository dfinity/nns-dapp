import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class DesktopTokensTableRowPo extends BasePageObject {
  private static readonly TID = "desktop-tokens-table-row-component";

  static async allUnder(
    element: PageObjectElement
  ): Promise<DesktopTokensTableRowPo[]> {
    return Array.from(
      await element.allByTestId(DesktopTokensTableRowPo.TID)
    ).map((el) => new DesktopTokensTableRowPo(el));
  }

  getProjectName(): Promise<string> {
    return this.getText("project-name");
  }

  getBalance(): Promise<string> {
    return this.getText("token-value-label");
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
