import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";

export class NnsStakedMaturityItemActionPo extends CommonItemActionPo {
  private static readonly TID = "nns-staked-maturity-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): NnsStakedMaturityItemActionPo {
    return new NnsStakedMaturityItemActionPo(
      element.byTestId(NnsStakedMaturityItemActionPo.TID)
    );
  }
}
