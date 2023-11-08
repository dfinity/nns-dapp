import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { DesktopTokensTablePo } from "./DesktopTokensTable.page-object";
import { MobileTokensListPo } from "./MobileTokensList.page-object";

export class TokensPagePo extends BasePageObject {
  private static readonly TID = "tokens-page-component";

  static under(element: PageObjectElement): TokensPagePo {
    return new TokensPagePo(element.byTestId(TokensPagePo.TID));
  }

  getDesktopTokensTable(): DesktopTokensTablePo {
    return DesktopTokensTablePo.under(this.root);
  }

  hasDesktopTokensTable(): Promise<boolean> {
    return this.getDesktopTokensTable().isPresent();
  }

  getMobileTokensList(): MobileTokensListPo {
    return MobileTokensListPo.under(this.root);
  }

  hasMobileTokensList(): Promise<boolean> {
    return this.getMobileTokensList().isPresent();
  }
}
