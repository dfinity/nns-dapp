import type { ButtonPo } from "$tests/page-objects/Button.page-object";
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

  getSpawnButton(): ButtonPo {
    return this.getButton("spawn-neuron-button");
  }

  getMaturity(): Promise<string> {
    return this.getText("available-maturity");
  }

  hasStakeButton(): Promise<boolean> {
    return this.getButton("stake-maturity-button").isPresent();
  }

  hasSpawnButton(): Promise<boolean> {
    return this.getSpawnButton().isPresent();
  }
}
