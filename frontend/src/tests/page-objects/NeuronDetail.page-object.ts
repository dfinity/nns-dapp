import { nonNullish } from "@dfinity/utils";
import { NnsNeuronDetailPo } from "./NnsNeuronDetail.page-object";
import { SnsNeuronDetailPo } from "./SnsNeuronDetail.page-object";

const tid = "neuron-detail-component";

export class NeuronDetailPo {
  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== tid) {
      throw new Error(`${root} is not a NeuronDetail`);
    }
    this.root = root;
  }

  static under(element: HTMLElement): NeuronDetailPo | null {
    const el = element.querySelector(`[data-tid=${tid}]`);
    return el && new NeuronDetailPo(el);
  }

  getNnsNeuronDetail(): NnsNeuronDetailPo | null {
    return NnsNeuronDetailPo.under(this.root);
  }

  getSnsNeuronDetail(): SnsNeuronDetailPo | null {
    return SnsNeuronDetailPo.under(this.root);
  }

  hasNnsNeuronDetail(): boolean {
    return nonNullish(this.getNnsNeuronDetail());
  }

  hasSnsNeuronDetail(): boolean {
    return nonNullish(this.getSnsNeuronDetail());
  }

  isContentLoaded() {
    return this.getNnsNeuronDetail()?.isContentLoaded() ||
      this.getSnsNeuronDetail()?.isContentLoaded() ||
      false;
  }
}
