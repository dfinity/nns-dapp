import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";

export class GetTokensPo extends BasePageObject {
  static readonly TID = "get-tokens-component";

  static under(element: PageObjectElement): GetTokensPo {
    return new GetTokensPo(element.byTestId(GetTokensPo.TID));
  }

  getTokensButtonPo(token: string): ButtonPo {
    return this.getButton(`get-${token}-button`);
  }

  clickGetTokens(token: string): Promise<void> {
    return this.getTokensButtonPo(token).click();
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

  async getTokens(amount: number, token: string): Promise<void> {
    await this.clickGetTokens(token);
    await this.enterAmount(amount);
    await this.clickSubmit();
    await this.waitForModalClosed();
  }
}
