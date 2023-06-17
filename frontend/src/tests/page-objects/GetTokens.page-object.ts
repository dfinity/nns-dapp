import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class GetTokensPo extends BasePageObject {
  static readonly TID = "get-tokens-component";

  static under(element: PageObjectElement): GetTokensPo {
    return new GetTokensPo(element.byTestId(GetTokensPo.TID));
  }

  clickGetTokens(): Promise<void> {
    return this.getButton("get-icp-button").click();
  }

  enterAmount(amount: number): Promise<void> {
    return this.getTextInput().typeText(amount.toString());
  }

  clickSubmit(): Promise<void> {
    return this.getButton("get-icp-submit").click();
  }

  waitForModalClosed(): Promise<void> {
    return this.root.byTestId("get-icp-form").waitForAbsent();
  }

  async getTokens(amount: number): Promise<void> {
    await this.clickGetTokens();
    await this.enterAmount(amount);
    await this.clickSubmit();
    await this.waitForModalClosed();
  }
}
