import { nonNullish } from "@dfinity/utils";
import { NnsNeuronsPo } from "./NnsNeurons.page-object";
import { SnsNeuronsPo } from "./SnsNeurons.page-object";

export class NeuronsPo {
  static readonly tid = "neurons-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== NeuronsPo.tid) {
      throw new Error(`${root} is not a Neurons`);
    }
    this.root = root;
  }

  static under(element: HTMLElement): NeuronsPo | null {
    const el = element.querySelector(`[data-tid=${NeuronsPo.tid}]`);
    return el && new NeuronsPo(el);
  }

  getNnsNeurons(): NnsNeuronsPo | null {
    return NnsNeuronsPo.under(this.root);
  }

  getSnsNeurons(): SnsNeuronsPo | null {
    return SnsNeuronsPo.under(this.root);
  }

  hasNnsNeurons(): boolean {
    return nonNullish(this.getNnsNeurons());
  }

  hasSnsNeurons(): boolean {
    return nonNullish(this.getSnsNeurons());
  }

  isContentLoaded() {
    return (
      this.getNnsNeurons()?.isContentLoaded() ||
      this.getSnsNeurons()?.isContentLoaded() ||
      false
    );
  }
}
