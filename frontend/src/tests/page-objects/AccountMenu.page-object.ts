import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TooltipIconPo } from "./TooltipIcon.page-object";

export class AccountMenuPo extends BasePageObject {
  private static readonly TID = "account-menu-component";

  static under(element: PageObjectElement): AccountMenuPo {
    return new AccountMenuPo(element.byTestId(AccountMenuPo.TID));
  }

  openMenu(): Promise<void> {
    return this.click("account-menu");
  }

  clickLogout(): Promise<void> {
    return this.click("logout");
  }

  clickCanisters(): Promise<void> {
    return this.click("canisters-button");
  }

  getMainIcpAccountIdTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(
      this.root.byTestId("main-icp-account-id-wrapper")
    );
  }
}
