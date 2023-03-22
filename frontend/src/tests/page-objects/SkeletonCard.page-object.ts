import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
export class SkeletonCardPo extends BasePageObject {
  static readonly tid = "skeleton-card";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static allUnder(element: PageObjectElement): SkeletonCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SkeletonCardPo.tid}]`)
    ).map((el) => new SkeletonCardPo(el));
  }
}
