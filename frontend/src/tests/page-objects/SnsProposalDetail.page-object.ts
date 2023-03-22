import { SkeletonCardPo } from "./SkeletonCard.page-object";

export class SnsProposalDetailPo {
  static readonly tid = "sns-proposal-details-grid";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): SnsProposalDetailPo | null {
    const el = element.querySelector(`[data-tid=${SnsProposalDetailPo.tid}]`);
    return el && new SnsProposalDetailPo(el);
  }

  getSkeletonCardPos(): SkeletonCardPo[] {
    return SkeletonCardPo.allUnder(this.root);
  }

  isContentLoaded(): boolean {
    return this.getSkeletonCardPos().length === 0;
  }
}
