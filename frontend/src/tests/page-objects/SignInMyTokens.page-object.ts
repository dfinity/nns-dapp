import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInMyTokensPagePo extends BasePageObject {
  private static readonly TID = "sign-in-my-tokens-page-component";

  static under(element: PageObjectElement): SignInMyTokensPagePo {
    return new SignInMyTokensPagePo(element.byTestId(SignInMyTokensPagePo.TID));
  }
}
