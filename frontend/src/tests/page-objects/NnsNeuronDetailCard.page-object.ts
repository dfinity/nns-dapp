import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronDetailCardPo extends BasePageObject {
  static under({
    element,
    testId = "nns-neuron-detail-card-component",
  }: {
    element: PageObjectElement;
    testId?: string;
  }): NnsNeuronDetailCardPo {
    return new NnsNeuronDetailCardPo(element.byTestId(testId));
  }

  getValue(testId: string): Promise<string> {
    return KeyValuePairPo.under({ element: this.root, testId }).getValueText();
  }

  getNeuronId(): Promise<string> {
    return this.getValue("neuron-id");
  }

  async getStake(): Promise<string> {
    return (await this.getValue("stake")).trim();
  }

  getDissolveDelay(): Promise<string> {
    return this.getValue("dissolve-delay");
  }

  getAge(): Promise<string> {
    return this.getValue("age");
  }

  getVotingPower(): Promise<string> {
    return this.getValue("voting-power");
  }

  getMaturity(): Promise<string> {
    return this.getValue("maturity");
  }

  getStakedMaturity(): Promise<string> {
    return this.getValue("staked-maturity");
  }
}
