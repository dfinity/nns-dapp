import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronSelectPercentagePo extends BasePageObject {
  private static readonly TID = "neuron-select-percentage-component";

  static under(element: PageObjectElement): NeuronSelectPercentagePo {
    return new NeuronSelectPercentagePo(
      element.byTestId(NeuronSelectPercentagePo.TID)
    );
  }

  getNextButton(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "select-maturity-percentage-button",
    });
  }

  getInputRange(): PageObjectElement {
    return this.root.byTestId("input-range");
  }

  clickNextButton(): Promise<void> {
    return this.getNextButton().click();
  }

  isNextButtonDisabled(): Promise<boolean> {
    return this.getNextButton().isDisabled();
  }

  setPercentage(percentage: number): Promise<void> {
    return this.getInputRange().input(`${percentage}`);
  }
}
