import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsNeuronInfoPo } from "$tests/page-objects/NnsNeuronInfo.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmNeuronsMergePo extends BasePageObject {
  static readonly TID = "confirm-neurons-merge-component";

  static under(element: PageObjectElement): ConfirmNeuronsMergePo {
    return new ConfirmNeuronsMergePo(
      element.byTestId(ConfirmNeuronsMergePo.TID)
    );
  }

  getSourceNeuronInfoPo(): NnsNeuronInfoPo {
    return NnsNeuronInfoPo.under({
      element: this.root,
      testId: "source-neuron-info",
    });
  }

  getTargetNeuronInfoPo(): NnsNeuronInfoPo {
    return NnsNeuronInfoPo.under({
      element: this.root,
      testId: "target-neuron-info",
    });
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getMergedNeuronInfoPo(): NnsNeuronInfoPo {
    return NnsNeuronInfoPo.under({
      element: this.root,
      testId: "merged-neuron-info",
    });
  }

  getConfirmMergeButtonPo(): ButtonPo {
    return this.getButton("confirm-merge-neurons-button");
  }

  getSourceNeuronId(): Promise<string> {
    return this.getSourceNeuronInfoPo().getNeuronId();
  }

  getTargetNeuronId(): Promise<string> {
    return this.getTargetNeuronInfoPo().getNeuronId();
  }

  hasMergeResultSection(): Promise<boolean> {
    return this.root.byTestId("merge-result-section").isPresent();
  }
}
