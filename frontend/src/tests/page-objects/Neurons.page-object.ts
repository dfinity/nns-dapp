import { NnsNeuronsPo } from "$tests/page-objects/NnsNeurons.page-object";
import { SnsNeuronsPo } from "$tests/page-objects/SnsNeurons.page-object";
import { nonNullish } from "@dfinity/utils";

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
