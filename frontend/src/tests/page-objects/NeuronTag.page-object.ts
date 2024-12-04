import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronTagPo extends BasePageObject {
  private static readonly TID = "neuron-tag-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static async allUnder(element: PageObjectElement): Promise<NeuronTagPo[]> {
    return Array.from(await element.allByTestId(NeuronTagPo.TID)).map(
      (el) => new NeuronTagPo(el)
    );
  }

  async isStatusDanger(): Promise<boolean> {
    return (await this.root.getClasses()).includes("error");
  }
}
