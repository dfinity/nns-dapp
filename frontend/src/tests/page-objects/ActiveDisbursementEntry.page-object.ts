import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActiveDisbursementEntryPo extends BasePageObject {
  private static readonly TID = "active-disbursement-entry-component";

  static under(element: PageObjectElement): ActiveDisbursementEntryPo {
    return new ActiveDisbursementEntryPo(
      element.byTestId(ActiveDisbursementEntryPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<ActiveDisbursementEntryPo[]> {
    return Array.from(
      await element.allByTestId(ActiveDisbursementEntryPo.TID)
    ).map((el) => new ActiveDisbursementEntryPo(el));
  }

  getDescriptionText(): Promise<string> {
    return this.getText("description");
  }

  getMaturityText(): Promise<string> {
    return this.getText("maturity");
  }
}
