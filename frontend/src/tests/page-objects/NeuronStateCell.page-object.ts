import { NeuronStateInfoPo } from "$tests/page-objects/NeuronStateInfo.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronStateCellPo extends TooltipPo {
  private static readonly TID = "neuron-state-cell-component";

  static under(element: PageObjectElement): NeuronStateCellPo {
    return new NeuronStateCellPo(element.byTestId(NeuronStateCellPo.TID));
  }

  getNeuronStateInfoPo(): NeuronStateInfoPo {
    return NeuronStateInfoPo.under(this.root);
  }

  getState(): Promise<string> {
    return this.getNeuronStateInfoPo().getState();
  }
}
