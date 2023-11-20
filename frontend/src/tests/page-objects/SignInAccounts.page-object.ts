import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInAccountsPo extends BasePageObject {
  static readonly TID = "accounts-landing-page";

  static under(element: PageObjectElement): SignInAccountsPo {
    return new SignInAccountsPo(element.byTestId(SignInAccountsPo.TID));
  }

  // TODO: Remove with ENABLE_MY_TOKENS flag
  hasEmptyCards(): Promise<boolean> {
    return this.isPresent("empty-cards-component");
  }
}
