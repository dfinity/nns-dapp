import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SignInTokensPagePo extends BasePageObject {
  private static readonly TID = "sign-in-tokens-page-component";

  static under(element: PageObjectElement): SignInTokensPagePo {
    return new SignInTokensPagePo(element.byTestId(SignInTokensPagePo.TID));
  }
}
