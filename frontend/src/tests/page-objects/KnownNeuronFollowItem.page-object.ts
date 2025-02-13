import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class KnownNeuronFollowItemPo extends BasePageObject {
  private static readonly TID = "known-neuron-item-component";

  static under(element: PageObjectElement): KnownNeuronFollowItemPo {
    return new KnownNeuronFollowItemPo(
      element.byTestId(KnownNeuronFollowItemPo.TID)
    );
  }

  static async allUnder(element: PageObjectElement): Promise<KnownNeuronFollowItemPo[]> {
    return Array.from(await element.allByTestId(KnownNeuronFollowItemPo.TID)).map(
      (el) => new KnownNeuronFollowItemPo(el)
    );
  }
}
