import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

export class GetTokensPo extends BasePageObject {
  static readonly TID = "get-tokens-component";

  static under(element: PageObjectElement): GetTokensPo {
    return new GetTokensPo(element.byTestId(GetTokensPo.TID));
  }

  clickGetIcpTokens(): Promise<void> {
    return this.getButton("get-icp-button").click();
  }

  getSnsTokensButton(): ButtonPo {
    return this.getButton("get-sns-button");
  }

  clickGetSnsTokens(): Promise<void> {
    return this.getSnsTokensButton().click();
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

  async getIcpTokens(amount: number): Promise<void> {
    await this.clickGetIcpTokens();
    await this.getTokens(amount);
  }

  async getSnsTokens(amount: number): Promise<void> {
    await this.clickGetSnsTokens();
    await this.getTokens(amount);
  }

  private async getTokens(amount: number): Promise<void> {
    await this.enterAmount(amount);
    await this.clickSubmit();
    await this.waitForModalClosed();
  }
}
