import { NnsNeuronDetailPo } from "$tests/page-objects/NnsNeuronDetail.page-object";
import { SnsNeuronDetailPo } from "$tests/page-objects/SnsNeuronDetail.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

export class NeuronDetailPo {
  static readonly tid = "neuron-detail-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): NeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${NeuronDetailPo.tid}]`);
    return el && new NeuronDetailPo(el);
  }

  getNnsNeuronDetailPo(): NnsNeuronDetailPo | null {
    return NnsNeuronDetailPo.under(this.root);
  }

  getSnsNeuronDetailPo(): SnsNeuronDetailPo | null {
    return SnsNeuronDetailPo.under(this.root);
  }

  hasNnsNeuronDetailPo(): boolean {
    return nonNullish(this.getNnsNeuronDetailPo());
  }

  hasSnsNeuronDetailPo(): boolean {
    return nonNullish(this.getSnsNeuronDetailPo());
  }

  isContentLoaded() {
    return (
      this.getNnsNeuronDetailPo()?.isContentLoaded() ||
      this.getSnsNeuronDetailPo()?.isContentLoaded() ||
      false
    );
  }
}
