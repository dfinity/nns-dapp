import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";

export class SnsAvailableMaturityItemActionPo extends CommonItemActionPo {
  private static readonly TID = "sns-available-maturity-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): SnsAvailableMaturityItemActionPo {
    return new SnsAvailableMaturityItemActionPo(
      element.byTestId(SnsAvailableMaturityItemActionPo.TID)
    );
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }
}
