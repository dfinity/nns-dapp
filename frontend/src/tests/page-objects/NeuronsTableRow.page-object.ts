import { NeuronIdCellPo } from "$tests/page-objects/NeuronIdCell.page-object";
import { NeuronMaturityCellPo } from "$tests/page-objects/NeuronMaturityCell.page-object";
import { NeuronStakeCellPo } from "$tests/page-objects/NeuronStakeCell.page-object";
import { NeuronStateCellPo } from "$tests/page-objects/NeuronStateCell.page-object";
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

  getNeuronStakeCellPo(): NeuronStakeCellPo {
    return NeuronStakeCellPo.under(this.root);
  }

  getNeuronMaturityCellPo(): NeuronMaturityCellPo {
    return NeuronMaturityCellPo.under(this.root);
  }

  getNeuronStateCellPo(): NeuronStateCellPo {
    return NeuronStateCellPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getNeuronIdCellPo().getNeurondId();
  }

  getTags(): Promise<string[]> {
    return this.getNeuronIdCellPo().getTags();
  }

  getStake(): Promise<string> {
    return this.getNeuronStakeCellPo().getStake();
  }

  getStakeInUsd(): Promise<string> {
    return this.getNeuronStakeCellPo().getStakeInUsd();
  }

  hasStakeInUsd(): Promise<boolean> {
    return this.getNeuronStakeCellPo().hasStakeInUsd();
  }

  // Stake without the currency symbol
  getStakeBalance(): Promise<string> {
    return this.getNeuronStakeCellPo().getStakeBalance();
  }

  getTotalMaturity(): Promise<string> {
    return this.getNeuronMaturityCellPo().getTotalMaturity();
  }

  getAvailableMaturity(): Promise<string> {
    return this.getNeuronMaturityCellPo().getAvailableMaturity();
  }

  getStakedMaturity(): Promise<string> {
    return this.getNeuronMaturityCellPo().getStakedMaturity();
  }

  getState(): Promise<string> {
    return this.getNeuronStateCellPo().getState();
  }

  getDissolveDelay(): Promise<string> {
    return this.getText("neuron-dissolve-delay-cell-component");
  }

  hasGoToDetailButton(): Promise<boolean> {
    return this.isPresent("go-to-neuron-detail-action");
  }
}
