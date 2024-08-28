import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { UniverseSummaryPo } from "./UniverseSummary.page-object";

export class CanisterHeaderPo extends BasePageObject {
  private static readonly TID = "canister-page-header-component";

  static under(element: PageObjectElement): CanisterHeaderPo {
    return new CanisterHeaderPo(element.byTestId(CanisterHeaderPo.TID));
  }

  getUniverseSummaryPo(): UniverseSummaryPo {
    return UniverseSummaryPo.under(this.root);
  }

  getUniverseText(): Promise<string> {
    return this.getUniverseSummaryPo().getTitle();
  }

  getCanisterIdText(): Promise<string> {
    return this.getText("identifier");
  }
}
