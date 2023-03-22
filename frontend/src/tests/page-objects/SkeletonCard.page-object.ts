import type { PageObjectElement } from "$tests/types/page-object.types";
export class SkeletonCardPo {
  static readonly tid = "skeleton-card";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static allUnder(element: PageObjectElement): SkeletonCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SkeletonCardPo.tid}]`)
    ).map((el) => new SkeletonCardPo(el));
  }
}
