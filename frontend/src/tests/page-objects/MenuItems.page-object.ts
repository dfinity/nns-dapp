import { BasePageObject } from "$tests/page-objects/base.page-object";
import { GetTokensPo } from "$tests/page-objects/GetTokens.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class MenuItemsPo extends BasePageObject {
  private static readonly TID = "menu-items-component";

  static under(element: PageObjectElement): MenuItemsPo {
    return new MenuItemsPo(element.byTestId(MenuItemsPo.TID));
  }

  clickAccounts(): Promise<void> {
    return this.click("menuitem-accounts");
  }

  clickNeuronStaking(): Promise<void> {
    return this.click("menuitem-neurons");
  }

  clickProposals(): Promise<void> {
    return this.click("menuitem-proposals");
  }

  clickLaunchpad(): Promise<void> {
    return this.click("menuitem-launchpad");
  }

  clickCanisters(): Promise<void> {
    return this.click("menuitem-canisters");
  }

  getGetTokensPo(): GetTokensPo {
    return GetTokensPo.under(this.root);
  }
}
