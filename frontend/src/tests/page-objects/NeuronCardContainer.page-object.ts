import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronCardContainerPo extends CardPo {
  private static readonly TID = "neuron-card";

  static under(element: PageObjectElement): NeuronCardContainerPo {
    return new NeuronCardContainerPo(
      element.byTestId(NeuronCardContainerPo.TID)
    );
  }
}
