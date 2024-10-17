import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronNavigationPo extends BasePageObject {
  private static readonly TID = "neuron-navigation";

  static under(element: PageObjectElement): NeuronNavigationPo {
    return new NeuronNavigationPo(element.byTestId(NeuronNavigationPo.TID));
  }

  getPreviousButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "neuron-navigation-previous",
    });
  }

  getNextButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "neuron-navigation-next",
    });
  }

  getPreviousNeuronId(): Promise<string | null> {
    return this.getPreviousButtonPo().root.getAttribute("data-test-neuron-id");
  }

  getNextNeuronId(): Promise<string | null> {
    return this.getNextButtonPo().root.getAttribute("data-test-neuron-id");
  }

  async isPreviousButtonHidden(): Promise<boolean> {
    return (await this.getPreviousButtonPo().root.getClasses()).includes(
      "hidden"
    );
  }

  async isNextButtonHidden(): Promise<boolean> {
    return (await this.getNextButtonPo().root.getClasses()).includes("hidden");
  }
}
