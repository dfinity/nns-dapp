import type { PageObjectElement } from "$tests/types/page-object.types";
import type { NeuronInfo } from "@dfinity/nns";
import { ButtonPo } from "./Button.page-object";
import { CheckboxPo } from "./Checkbox.page-object";
import { NeuronVisibilityCellPo } from "./NeuronVisibilityCell.page-object";
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

  getNeuronRow(neuron: NeuronInfo): PageObjectElement {
    return this.root.byTestId(`neuron-row-${neuron.neuronId.toString()}`);
  }

  getNeuronCheckbox(neuron: NeuronInfo): CheckboxPo {
    return CheckboxPo.under({ element: this.getNeuronRow(neuron) });
  }

  getUncontrollableNeuronRow(neuron: NeuronInfo): PageObjectElement {
    return this.root.byTestId(
      `uncontrollable-neuron-row-${neuron.neuronId.toString()}`
    );
  }

  getConfirmButton(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "confirm-button" });
  }

  getCancelButton(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "cancel-button" });
  }

  async isLoading(): Promise<boolean> {
    return this.getLoadingContainer().isPresent();
  }

  async isApplyToAllVisible(): Promise<boolean> {
    return this.getApplyToAllContainer().isPresent();
  }

  async isControllableNeuronsListVisible(): Promise<boolean> {
    return this.getControllableNeuronsList().isPresent();
  }

  async isUncontrollableNeuronsListVisible(): Promise<boolean> {
    return this.getUncontrollableNeuronsList().isPresent();
  }

  async isNeuronRowVisible(neuron: NeuronInfo): Promise<boolean> {
    return this.getNeuronRow(neuron).isPresent();
  }

  async isUncontrollableNeuronRowVisible(neuron: NeuronInfo): Promise<boolean> {
    return this.getUncontrollableNeuronRow(neuron).isPresent();
  }

  async clickApplyToAll(): Promise<void> {
    await this.getApplyToAllCheckbox().click();
  }

  async clickNeuronCheckbox(neuron: NeuronInfo): Promise<void> {
    await this.getNeuronCheckbox(neuron).click();
  }

  async isNeuronCheckboxChecked(neuron: NeuronInfo): Promise<boolean> {
    return this.getNeuronCheckbox(neuron).isChecked();
  }

  async clickConfirm(): Promise<void> {
    await this.getConfirmButton().click();
  }

  async clickCancel(): Promise<void> {
    await this.getCancelButton().click();
  }

  async getApplyToAllText(): Promise<string> {
    return this.getApplyToAllCheckbox().getText();
  }

  async getUncontrollableNeuronsDescriptionText(): Promise<string> {
    return this.getUncontrollableNeuronsDescription().getText();
  }

  getNeuronVisibilityCell(neuron: NeuronInfo): NeuronVisibilityCellPo {
    return NeuronVisibilityCellPo.under(this.root, neuron.neuronId.toString());
  }
}
