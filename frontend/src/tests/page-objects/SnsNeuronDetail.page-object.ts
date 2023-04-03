import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SnsNeuronFollowingCardPo } from "./SnsNeuronFollowingCard.page-object";
import { SnsNeuronHotkeysCardPo } from "./SnsNeuronHotkeysCard.page-object";
import { SnsNeuronInfoStakePo } from "./SnsNeuronInfoStake.page-object";
import { SnsNeuronMaturityCardPo } from "./SnsNeuronMaturityCard.page-object";
import { SnsNeuronMetaInfoCardPo } from "./SnsNeuronMetaInfoCard.page-object";
import { SummaryPo } from "./Summary.page-object";

export class SnsNeuronDetailPo extends BasePageObject {
  private static readonly TID = "sns-neuron-detail-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronDetailPo {
    return new SnsNeuronDetailPo(element.byTestId(SnsNeuronDetailPo.TID));
  }

  getSkeletonCardPos(): Promise<SkeletonCardPo[]> {
    return SkeletonCardPo.allUnder(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && (await this.getSkeletonCardPos()).length === 0
    );
  }

  getMetaInfoCardPo(): SnsNeuronMetaInfoCardPo {
    return SnsNeuronMetaInfoCardPo.under(this.root);
  }

  getHotkeysCardPo(): SnsNeuronHotkeysCardPo {
    return SnsNeuronHotkeysCardPo.under(this.root);
  }

  getMaturityCardPo(): SnsNeuronMaturityCardPo {
    return SnsNeuronMaturityCardPo.under(this.root);
  }

  getStakeCardPo(): SnsNeuronInfoStakePo {
    return SnsNeuronInfoStakePo.under(this.root);
  }

  getFollowingCardPo(): SnsNeuronFollowingCardPo {
    return SnsNeuronFollowingCardPo.under(this.root);
  }

  getSummaryPo(): SummaryPo {
    return SummaryPo.under(this.root);
  }

  getTitle(): Promise<string> {
    return this.getSummaryPo().getTitle();
  }
}
