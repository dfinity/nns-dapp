import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { NeuronSelectPercentagePo } from "$tests/page-objects/NeuronSelectPercentage.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SpawnNeuronModalPo extends ModalPo {
  private static TID = "spawn-neuron-modal-component";

  static under(element: PageObjectElement): SpawnNeuronModalPo {
    return new SpawnNeuronModalPo(element.byTestId(SpawnNeuronModalPo.TID));
  }

  getNeuronSelectPercentagePo(): NeuronSelectPercentagePo {
    return NeuronSelectPercentagePo.under(this.root);
  }

  async spawnNeuron({ percentage }: { percentage: number }): Promise<void> {
    await this.getNeuronSelectPercentagePo().spawnNeuron({ percentage });
    await this.waitForClosed();
  }
}
