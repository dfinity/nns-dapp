import type { PageObjectElement } from "$tests/types/page-object.types";
import { TagPo } from "./Tag.page-object";

export class NeuronTagPo extends TagPo {
  private static readonly NeuronTagTID = "neuron-tag-component";

  static under(element: PageObjectElement): NeuronTagPo {
    return new NeuronTagPo(element.byTestId(NeuronTagPo.NeuronTagTID));
  }

  static async allUnder(element: PageObjectElement): Promise<NeuronTagPo[]> {
    return Array.from(await element.allByTestId(NeuronTagPo.NeuronTagTID)).map(
      (el) => new NeuronTagPo(el)
    );
  }
}
