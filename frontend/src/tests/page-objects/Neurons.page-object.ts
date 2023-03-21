import { nonNullish } from "@dfinity/utils";
import { NnsNeuronsPo } from "./NnsNeurons.page-object";
import { SnsNeuronsPo } from "./SnsNeurons.page-object";

export class NeuronsPo {
  static readonly tid = "neurons-component";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: HTMLElement): NeuronsPo | null {
    const el = element.querySelector(`[data-tid=${NeuronsPo.tid}]`);
    return el && new NeuronsPo(el);
  }

  getNnsNeuronsPo(): NnsNeuronsPo | null {
    return NnsNeuronsPo.under(this.root);
  }

  getSnsNeuronsPo(): SnsNeuronsPo | null {
    return SnsNeuronsPo.under(this.root);
  }

  hasNnsNeuronsPo(): boolean {
    return nonNullish(this.getNnsNeuronsPo());
  }

  hasSnsNeuronsPo(): boolean {
    return nonNullish(this.getSnsNeuronsPo());
  }

  isContentLoaded() {
    return (
      this.getNnsNeuronsPo()?.isContentLoaded() ||
      this.getSnsNeuronsPo()?.isContentLoaded() ||
      false
    );
  }
}
