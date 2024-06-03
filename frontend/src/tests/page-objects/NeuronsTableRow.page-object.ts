import { NeuronIdCellPo } from "$tests/page-objects/NeuronIdCell.page-object";
import { NeuronStateInfoPo } from "$tests/page-objects/NeuronStateInfo.page-object";
import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsTableRowPo extends ResponsiveTableRowPo {
  static under(element: PageObjectElement): NeuronsTableRowPo {
    return new NeuronsTableRowPo(element.byTestId(ResponsiveTableRowPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NeuronsTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
      (el) => new NeuronsTableRowPo(el)
    );
  }

  getNeuronIdCellPo(): NeuronIdCellPo {
    return NeuronIdCellPo.under(this.root);
  }

  getNeuronStateInfoPo(): NeuronStateInfoPo {
    return NeuronStateInfoPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getNeuronIdCellPo().getNeurondId();
  }

  getStake(): Promise<string> {
    return this.getText("neuron-stake-cell-component");
  }

  getState(): Promise<string> {
    return this.getNeuronStateInfoPo().getState();
  }

  getDissolveDelay(): Promise<string> {
    return this.getText("neuron-dissolve-delay-cell-component");
  }

  hasGoToDetailButton(): Promise<boolean> {
    return this.isPresent("go-to-neuron-detail-action");
  }
}
