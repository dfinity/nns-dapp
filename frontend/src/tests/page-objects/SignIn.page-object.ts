import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInPo extends BasePageObject {
  private static readonly TID = "login-button";

  static under(element: PageObjectElement): SignInPo {
    return new SignInPo(element.byTestId(SignInPo.TID));
  }
}
