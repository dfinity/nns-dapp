import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";

export class SnsStakedMaturityItemActionPo extends CommonItemActionPo {
  private static readonly TID = "sns-staked-maturity-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): SnsStakedMaturityItemActionPo {
    return new SnsStakedMaturityItemActionPo(
      element.byTestId(SnsStakedMaturityItemActionPo.TID)
    );
  }
}
