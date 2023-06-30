import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsNeuronDetailCardPo } from "$tests/page-objects/NnsNeuronDetailCard.page-object";
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

  getSourceNeuronDetailCardPo(): NnsNeuronDetailCardPo {
    return NnsNeuronDetailCardPo.under({
      element: this.root,
      testId: "source-neuron-card",
    });
  }

  getTargetNeuronInfoPo(): NnsNeuronInfoPo {
    return NnsNeuronInfoPo.under({
      element: this.root,
      testId: "target-neuron-info",
    });
  }

  getTargetNeuronDetailCardPo(): NnsNeuronDetailCardPo {
    return NnsNeuronDetailCardPo.under({
      element: this.root,
      testId: "target-neuron-card",
    });
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getMergedNeuronDetailCardPo(): NnsNeuronDetailCardPo {
    return NnsNeuronDetailCardPo.under({
      element: this.root,
      testId: "merged-neuron-card",
    });
  }

  getConfirmMergeButtonPo(): ButtonPo {
    return this.getButton("confirm-merge-neurons-button");
  }

  getSourceNeuronId(): Promise<string> {
    return this.getSourceNeuronDetailCardPo().getNeuronId();
  }

  getTargetNeuronId(): Promise<string> {
    return this.getTargetNeuronDetailCardPo().getNeuronId();
  }

  hasMergeResultSection(): Promise<boolean> {
    return this.root.byTestId("merge-result-section").isPresent();
  }
}
