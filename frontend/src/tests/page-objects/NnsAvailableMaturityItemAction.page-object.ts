import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAvailableMaturityItemActionPo extends BasePageObject {
  private static readonly TID = "nns-available-maturity-item-action-component";

  static under(element: PageObjectElement): NnsAvailableMaturityItemActionPo {
    return new NnsAvailableMaturityItemActionPo(
      element.byTestId(NnsAvailableMaturityItemActionPo.TID)
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getMaturity(): Promise<string> {
    return this.getText("available-maturity");
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
