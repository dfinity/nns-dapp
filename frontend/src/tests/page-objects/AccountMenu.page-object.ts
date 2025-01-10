import { AccountDetailsPo } from "$tests/page-objects/AccountDetails.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AccountMenuPo extends BasePageObject {
  private static readonly TID = "account-menu-component";

  static under(element: PageObjectElement): AccountMenuPo {
    return new AccountMenuPo(element.byTestId(AccountMenuPo.TID));
  }

  isOpen(): Promise<boolean> {
    return this.isPresent("popover-component");
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

  getSignInButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "toolbar-login",
    });
  }

  getSignOutButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "logout",
    });
  }

  getLinkToSettingsPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "settings",
    });
  }

  getManangeIILinkPo(): LinkPo {
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

  getLinkToReportingPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "reporting",
    });
  }
}
