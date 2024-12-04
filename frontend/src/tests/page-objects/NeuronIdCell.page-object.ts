import { BasePageObject } from "$tests/page-objects/base.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NeuronTagPo } from "./NeuronTag.page-object";
import { TooltipPo } from "./Tooltip.page-object";

export class NeuronIdCellPo extends BasePageObject {
  private static readonly TID = "neuron-id-cell-component";

  static under(element: PageObjectElement): NeuronIdCellPo {
    return new NeuronIdCellPo(element.byTestId(NeuronIdCellPo.TID));
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getNeurondId(): Promise<string> {
    return this.getHashPo().getFullText();
  }

  hasTagsElement(): Promise<boolean> {
    return this.root.byTestId("neuron-tags").isPresent();
  }

  async getTagPos(): Promise<NeuronTagPo[]> {
    return NeuronTagPo.allUnder(this.root.byTestId("neuron-tags"));
  }

  async getTags(): Promise<string[]> {
    const tagElements = await this.getTagPos();
    return Promise.all(tagElements.map((el) => el.getText()));
  }

  getPublicNeuronTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root.byTestId("public-icon-container"));
  }
}
