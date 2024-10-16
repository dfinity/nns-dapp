import type { PageObjectElement } from "$tests/types/page-object.types";
import type { NeuronInfo } from "@dfinity/nns";
import { ButtonPo } from "./Button.page-object";
import { CheckboxPo } from "./Checkbox.page-object";
import { NeuronVisibilityRowPo } from "./NeuronVisibilityRow.page-object";
import { BasePageObject } from "./base.page-object";

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

  getApplyToAllContainer(): PageObjectElement {
    return this.root.byTestId("apply-to-all-container");
  }

  getApplyToAllCheckbox(): CheckboxPo {
    return CheckboxPo.under({ element: this.getApplyToAllContainer() });
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

  getNeuronVisibilityRowPo(neuron: NeuronInfo): NeuronVisibilityRowPo {
    return NeuronVisibilityRowPo.under({
      element: this.root,
      neuronId: neuron.neuronId.toString(),
    });
  }
}
