import { ConfirmNeuronsMergePo } from "$tests/page-objects/ConfirmNeuronsMerge.page-object";
import { SelectNeuronsToMergePo } from "$tests/page-objects/SelectNeuronsToMerge.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class MergeNeuronsModalPo extends BasePageObject {
  static readonly TID = "merge-neurons-modal-component";

  static under(element: PageObjectElement): MergeNeuronsModalPo {
    return new MergeNeuronsModalPo(element.byTestId(MergeNeuronsModalPo.TID));
  }

  getSelectNeuronsToMergePo(): SelectNeuronsToMergePo {
    return SelectNeuronsToMergePo.under(this.root);
  }

  getConfirmNeuronsMergePo(): ConfirmNeuronsMergePo {
    return ConfirmNeuronsMergePo.under(this.root);
  }

  getTitle(): Promise<string> {
    return this.getText("modal-title");
  }

  async mergeNeurons({
    sourceNeurondId,
    targetNeuronId,
  }: {
    sourceNeurondId: string;
    targetNeuronId: string;
  }): Promise<void> {
    await this.getSelectNeuronsToMergePo().selectNeurons({
      sourceNeurondId,
      targetNeuronId,
    });
    await this.getConfirmNeuronsMergePo().getConfirmMergeButtonPo().click();
    await this.waitForAbsent();
  }
}
