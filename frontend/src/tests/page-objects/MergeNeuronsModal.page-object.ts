import { ConfirmNeuronsMergePo } from "$tests/page-objects/ConfirmNeuronsMerge.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { SelectNeuronsToMergePo } from "$tests/page-objects/SelectNeuronsToMerge.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class MergeNeuronsModalPo extends ModalPo {
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

    // We wait for the component to appear to ensure the UI remains stable and the button is within the viewport
    await this.getConfirmNeuronsMergePo()
      .getMergedNeuronDetailCardPo()
      .waitFor();
    await this.getConfirmNeuronsMergePo().getConfirmMergeButtonPo().click();
    await this.waitForAbsent();
  }
}
