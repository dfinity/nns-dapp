import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommonItemActionPo } from "./CommonItemAction.page-object";

export class NnsAvailableMaturityItemActionPo extends CommonItemActionPo {
  private static readonly TID = "nns-available-maturity-item-action-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): NnsAvailableMaturityItemActionPo {
    return new NnsAvailableMaturityItemActionPo(
      element.byTestId(NnsAvailableMaturityItemActionPo.TID)
    );
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }

  hasSpawnButton(): Promise<boolean> {
    // The spawn button is wrapped by `TestIdWrapper` because
    // it might render a simple button or a Tooltip and a button inside it.
    return this.root.byTestId("spawn-neuron-button-component").isPresent();
  }
}
