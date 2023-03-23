import type { PageObjectElement } from "$tests/types/page-object.types";
<<<<<<< HEAD
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SkeletonDetailsPo } from "./SkeletonDetails.page-object";

export class SnsProposalDetailPo extends BasePageObject {
  static readonly tid = "sns-proposal-details-grid";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsProposalDetailPo | null {
    return new SnsProposalDetailPo(
      element.querySelector(`[data-tid=${SnsProposalDetailPo.tid}]`)
    );
  }

  getSkeletonDetails(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonDetails().isPresent())
    );
=======
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
>>>>>>> main
  }
}
