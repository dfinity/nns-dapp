import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SignInMyTokensPagePo } from "./SignInMyTokens.page-object";

export class MyTokensPagePo extends BasePageObject {
  private static readonly TID = "my-tokens-page-component";

  static under(element: PageObjectElement): MyTokensPagePo {
    return new MyTokensPagePo(element.byTestId(MyTokensPagePo.TID));
  }

  hasLoginPage(): Promise<boolean> {
    return SignInMyTokensPagePo.under(this.root).isPresent();
  }

  hasMyTokensPage(): Promise<boolean> {
    return this.isPresent();
  }
}
