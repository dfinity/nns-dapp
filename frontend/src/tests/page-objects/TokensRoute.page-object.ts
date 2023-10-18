import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SignInTokensPagePo } from "./SignInTokens.page-object";
import { TokensPagePo } from "./TokensPage.page-object";

export class TokensRoutePo extends BasePageObject {
  private static readonly TID = "tokens-route-component";

  static under(element: PageObjectElement): TokensRoutePo {
    return new TokensRoutePo(element.byTestId(TokensRoutePo.TID));
  }

  hasLoginPage(): Promise<boolean> {
    return SignInTokensPagePo.under(this.root).isPresent();
  }

  hasTokensPage(): Promise<boolean> {
    return TokensPagePo.under(this.root).isPresent();
  }
}
