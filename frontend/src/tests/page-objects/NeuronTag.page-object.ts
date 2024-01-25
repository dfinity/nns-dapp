import { TagPo } from "$tests/page-objects/Tag.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TooltipPo } from "./Tooltip.page-object";

export class NeuronTagPo extends BasePageObject {
  private static readonly TID = "neuron-tag";

  static under(element: PageObjectElement): NeuronTagPo {
    return new NeuronTagPo(element.byTestId(NeuronTagPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<NeuronTagPo[]> {
    return Promise.all(
      Array.from(await element.allByTestId(NeuronTagPo.TID)).map(async (el) => {
        return new NeuronTagPo(el);
      })
    );
  }

  getTag(): TagPo {
    return TagPo.under(this.root);
  }

  getTagText(): Promise<string> {
    return this.getTag().getText();
  }

  getTooltip(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getTooltipText(): Promise<string> {
    return TooltipPo.under(this.root).getText();
  }
}
