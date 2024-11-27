import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ExportNeuronsButtonPo } from "$tests/page-objects/ExportNeuronsButton.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AccountDetailsPo } from "./AccountDetails.page-object";
import { LinkPo } from "./Link.page-object";

export class AccountMenuPo extends BasePageObject {
  private static readonly TID = "account-menu-component";

  static under(element: PageObjectElement): AccountMenuPo {
    return new AccountMenuPo(element.byTestId(AccountMenuPo.TID));
  }

  isOpen(): Promise<boolean> {
    const popover = this.root.querySelector('[role="menu"]');
    return popover.isPresent();
  }

  openMenu(): Promise<void> {
    return this.click("account-menu");
  }

  clickLogout(): Promise<void> {
    return this.click("logout");
  }

  getCanistersLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "canisters-button",
    });
  }

  getSignInButtonPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "toolbar-login",
    });
  }

  getSignOutButtonPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "logout",
    });
  }

  getSettingsButtonPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "settings",
    });
  }

  getManangeIIButtonPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "manage-ii-link",
    });
  }

  clickCanisters(): Promise<void> {
    return this.getCanistersLinkPo().click();
  }

  getAccountDetailsPo(): AccountDetailsPo {
    return AccountDetailsPo.under(this.root);
  }

  getExportNeuronsButtonPo(): ExportNeuronsButtonPo {
    return ExportNeuronsButtonPo.under({ element: this.root });
  }
}
