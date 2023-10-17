import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { UniversePageSummaryPo } from "./UniversePageSummary.page-object";

export class CanisterHeaderPo extends BasePageObject {
  private static readonly TID = "canister-page-header-component";

  static under(element: PageObjectElement): CanisterHeaderPo {
    return new CanisterHeaderPo(element.byTestId(CanisterHeaderPo.TID));
  }

  getUniversePageSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  getUniverseText(): Promise<string> {
    return this.getUniversePageSummaryPo().getTitle();
  }

  getCanisterIdText(): Promise<string> {
    return this.getText("identifier");
  }
}
