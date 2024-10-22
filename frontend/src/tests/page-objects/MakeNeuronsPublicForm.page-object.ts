import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "./Button.page-object";
import { CheckboxPo } from "./Checkbox.page-object";
import { NeuronVisibilityRowPo } from "./NeuronVisibilityRow.page-object";
import { BasePageObject } from "./base.page-object";

export class MakeNeuronsPublicFormPo extends BasePageObject {
  private static readonly TID = "make-neurons-public-form-component";

  static under(element: PageObjectElement): MakeNeuronsPublicFormPo {
    return new MakeNeuronsPublicFormPo(
      element.byTestId(MakeNeuronsPublicFormPo.TID)
    );
  }

  getLoadingContainer(): PageObjectElement {
    return this.root.byTestId("loading-container");
  }

  getApplyToAllCheckbox(): CheckboxPo {
    return CheckboxPo.under({
      element: this.root.byTestId("apply-to-all-container"),
    });
  }

  getNeuronsListsContainer(): PageObjectElement {
    return this.root.byTestId("neurons-lists-container");
  }

  getControllableNeuronsList(): PageObjectElement {
    return this.root.byTestId("controllable-neurons-list");
  }

  getUncontrollableNeuronsList(): PageObjectElement {
    return this.root.byTestId("uncontrollable-neurons-list");
  }

  getControllableNeuronsDescription(): PageObjectElement {
    return this.root.byTestId("controllable-neurons-description");
  }

  getUncontrollableNeuronsDescription(): PageObjectElement {
    return this.root.byTestId("uncontrollable-neurons-description");
  }

  getConfirmButton(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "confirm-button" });
  }

  getCancelButton(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "cancel-button" });
  }

  getControllableNeuronVisibilityRowPo(
    neuronId: string
  ): NeuronVisibilityRowPo {
    return NeuronVisibilityRowPo.under({
      element: this.root.byTestId("controllable-neurons-list"),
      neuronId,
    });
  }

  getUncontrollableNeuronVisibilityRowPo(
    neuronId: string
  ): NeuronVisibilityRowPo {
    return NeuronVisibilityRowPo.under({
      element: this.root.byTestId("uncontrollable-neurons-list"),
      neuronId,
    });
  }

  async getControllableNeuronIds(): Promise<string[]> {
    const controllableList = this.getControllableNeuronsList();
    return this.getNeuronIdsFromList(controllableList);
  }

  async getUncontrollableNeuronIds(): Promise<string[]> {
    const uncontrollableList = this.getUncontrollableNeuronsList();
    return this.getNeuronIdsFromList(uncontrollableList);
  }

  private async getNeuronIdsFromList(
    list: PageObjectElement
  ): Promise<string[]> {
    const neuronIdElements = await list.querySelectorAll(
      '[data-tid="neuron-id"]'
    );
    return Promise.all(
      neuronIdElements.map(async (element) => {
        const text = await element.getText();
        return text.trim();
      })
    );
  }
}
