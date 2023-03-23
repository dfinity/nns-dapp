import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";
import { SkeletonDetailsPo } from "./SkeletonDetails.page-object";

export class SnsProposalDetailPo {
  static readonly tid = "sns-proposal-details-grid";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): SnsProposalDetailPo | null {
    const el = element.querySelector(`[data-tid=${SnsProposalDetailPo.tid}]`);
    return el && new SnsProposalDetailPo(el);
  }

  getSkeletonDetails(): SkeletonDetailsPo | null {
    return SkeletonDetailsPo.under(this.root);
  }

  isContentLoaded(): boolean {
    return isNullish(this.getSkeletonDetails());
  }
}
