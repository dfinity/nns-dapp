import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";

export class GetTokensPo extends BasePageObject {
  static readonly TID = "get-tokens-component";

  static under(element: PageObjectElement): GetTokensPo {
    return new GetTokensPo(element.byTestId(GetTokensPo.TID));
  }

  clickGetTokens(): Promise<void> {
    return this.getButton("get-tokens-button").click();
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

  getDropdown(): DropdownPo {
    return DropdownPo.under(this.root);
  }

  waitForOption(testId: string): Promise<void> {
    return this.getDropdown().waitForOption(testId);
  }

  async getIcpTokens(amount: number): Promise<void> {
    await this.clickGetTokens();
    await this.waitForOption("Internet Computer");
    await this.getTokens(amount);
  }

  async getSnsTokens({
    amount,
    name,
  }: {
    amount: number;
    name: string;
  }): Promise<void> {
    await this.clickGetTokens();
    await this.waitForOption(name);
    await this.getDropdown().select(name);
    await this.getTokens(amount);
  }

  async getBtc(amount: number): Promise<void> {
    await this.clickGetTokens();
    await this.waitForOption("ckBTC");
    await this.getDropdown().select("ckBTC");
    await this.getTokens(amount);
  }

  private async getTokens(amount: number): Promise<void> {
    await this.enterAmount(amount);
    await this.clickSubmit();
    await this.waitForModalClosed();
  }
}
