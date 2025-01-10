import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { NeuronVisibilityRowPo } from "$tests/page-objects/NeuronVisibilityRow.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class ChangeBulkNeuronVisibilityFormPo extends BasePageObject {
  private static readonly TID = "change-bulk-visibility-component";

  static under(element: PageObjectElement): ChangeBulkNeuronVisibilityFormPo {
    return new ChangeBulkNeuronVisibilityFormPo(
      element.byTestId(ChangeBulkNeuronVisibilityFormPo.TID)
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
    const neuronIdElements = await list.allByTestId("neuron-id");
    return Promise.all(
      neuronIdElements.map(async (element) => {
        const text = await element.getText();
        return text.trim();
      })
    );
  }
}
