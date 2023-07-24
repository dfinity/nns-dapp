import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LoginLinksPo extends BasePageObject {
  private static readonly TID = "login-links-component";

  static under(element: PageObjectElement): LoginLinksPo {
    return new LoginLinksPo(element.byTestId(LoginLinksPo.TID));
  }

  goToLaunchpad(): Promise<void> {
    return this.click("auth-link-launchpad");
  }
}
