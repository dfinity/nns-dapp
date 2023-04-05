import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsNeuronDetailPo } from "$tests/page-objects/NnsNeuronDetail.page-object";
import { SnsNeuronDetailPo } from "$tests/page-objects/SnsNeuronDetail.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronDetailPo extends BasePageObject {
  private static readonly TID = "neuron-detail-component";

  static under(element: PageObjectElement): NeuronDetailPo {
    return new NeuronDetailPo(element.byTestId(NeuronDetailPo.TID));
  }

  getNnsNeuronDetailPo(): NnsNeuronDetailPo {
    return NnsNeuronDetailPo.under(this.root);
  }

  getSnsNeuronDetailPo(): SnsNeuronDetailPo {
    return SnsNeuronDetailPo.under(this.root);
  }

  hasNnsNeuronDetailPo(): Promise<boolean> {
    return this.getNnsNeuronDetailPo().isPresent();
  }

  hasSnsNeuronDetailPo(): Promise<boolean> {
    return this.getSnsNeuronDetailPo().isPresent();
  }

  async isContentLoaded(): Promise<boolean> {
    const [nnsLoaded, snsLoaded] = await Promise.all([
      this.getNnsNeuronDetailPo().isContentLoaded(),
      this.getSnsNeuronDetailPo().isContentLoaded(),
    ]);
    return nnsLoaded || snsLoaded;
  }
}
