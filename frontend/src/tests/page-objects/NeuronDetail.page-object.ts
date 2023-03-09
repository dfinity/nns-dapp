import { nonNullish } from "@dfinity/utils";
import { NnsNeuronDetailPo } from "./NnsNeuronDetail.page-object";
import { SnsNeuronDetailPo } from "./SnsNeuronDetail.page-object";

export class NeuronDetailPo {
  static readonly tid = "neuron-detail-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== NeuronDetailPo.tid) {
      throw new Error(`${root} is not a NeuronDetail`);
    }
    this.root = root;
  }

  static under(element: HTMLElement): NeuronDetailPo | null {
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
