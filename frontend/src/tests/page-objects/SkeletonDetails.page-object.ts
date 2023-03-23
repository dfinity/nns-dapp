import type { PageObjectElement } from "$tests/types/page-object.types";

export class SkeletonDetailsPo {
  static readonly tid = "skeleton-details-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): SkeletonDetailsPo | null {
    const el = element.querySelector(`[data-tid=${SkeletonDetailsPo.tid}]`);
    return el && new SkeletonDetailsPo(el);
  }
}
