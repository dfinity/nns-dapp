import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronsMissingRewardsBadgePo extends BasePageObject {
  private static readonly TID = "nns-neurons-missing-rewards-badge-component";

  static under(element: PageObjectElement): NnsNeuronsMissingRewardsBadgePo {
    return new NnsNeuronsMissingRewardsBadgePo(
      element.byTestId(NnsNeuronsMissingRewardsBadgePo.TID)
    );
  }

  isVisible(): Promise<boolean> {
    return this.root.byTestId("badge").isPresent();
  }
}
