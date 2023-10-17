import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { MyTokensPagePo } from "./MyTokensPage.page-object";
import { SignInMyTokensPagePo } from "./SignInMyTokens.page-object";

export class MyTokensRoutePo extends BasePageObject {
  private static readonly TID = "my-tokens-route-component";

  static under(element: PageObjectElement): MyTokensRoutePo {
    return new MyTokensRoutePo(element.byTestId(MyTokensRoutePo.TID));
  }

  hasLoginPage(): Promise<boolean> {
    return SignInMyTokensPagePo.under(this.root).isPresent();
  }

  hasMyTokensPage(): Promise<boolean> {
    return MyTokensPagePo.under(this.root).isPresent();
  }
}
