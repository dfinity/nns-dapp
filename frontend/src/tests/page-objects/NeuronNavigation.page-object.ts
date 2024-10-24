import { LinkPo } from "$tests/page-objects/Link.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronNavigationPo extends BasePageObject {
  private static readonly TID = "neuron-navigation";

  static under(element: PageObjectElement): NeuronNavigationPo {
    return new NeuronNavigationPo(element.byTestId(NeuronNavigationPo.TID));
  }

  getPreviousLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "neuron-navigation-previous",
    });
  }

  getNextLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "neuron-navigation-next",
    });
  }

  getPreviousNeuronId(): Promise<string | null> {
    return this.getPreviousLinkPo().root.getAttribute("data-test-neuron-id");
  }

  getNextNeuronId(): Promise<string | null> {
    return this.getNextLinkPo().root.getAttribute("data-test-neuron-id");
  }

  async isPreviousLinkHidden(): Promise<boolean> {
    return (await this.getPreviousLinkPo().root.getClasses())?.includes(
      "hidden"
    );
  }

  async isNextLinkHidden(): Promise<boolean> {
    return (await this.getNextLinkPo().root.getClasses())?.includes("hidden");
  }
}
