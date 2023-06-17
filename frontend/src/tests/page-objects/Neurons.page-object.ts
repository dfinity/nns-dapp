import { NnsNeuronsPo } from "$tests/page-objects/NnsNeurons.page-object";
import { NnsNeuronsFooterPo } from "$tests/page-objects/NnsNeuronsFooter.page-object";
import { SnsNeuronsPo } from "$tests/page-objects/SnsNeurons.page-object";
import { SnsNeuronsFooterPo } from "$tests/page-objects/SnsNeuronsFooter.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronsPo extends BasePageObject {
  private static readonly TID = "neurons-component";

  static under(element: PageObjectElement): NeuronsPo {
    return new NeuronsPo(element.byTestId(NeuronsPo.TID));
  }

  getNnsNeuronsPo(): NnsNeuronsPo {
    return NnsNeuronsPo.under(this.root);
  }

  getNnsNeuronsFooterPo(): NnsNeuronsFooterPo {
    return NnsNeuronsFooterPo.under(this.root);
  }

  getSnsNeuronsPo(): SnsNeuronsPo {
    return SnsNeuronsPo.under(this.root);
  }

  getSnsNeuronsFooterPo(): SnsNeuronsFooterPo {
    return SnsNeuronsFooterPo.under(this.root);
  }

  hasNnsNeuronsPo(): Promise<boolean> {
    return this.getNnsNeuronsPo().isPresent();
  }

  hasSnsNeuronsPo(): Promise<boolean> {
    return this.getSnsNeuronsPo().isPresent();
  }

  async isContentLoaded(): Promise<boolean> {
    const [nnsLoaded, snsLoaded] = await Promise.all([
      this.getNnsNeuronsPo().isContentLoaded(),
      this.getSnsNeuronsPo().isContentLoaded(),
    ]);
    return nnsLoaded || snsLoaded;
  }
}
