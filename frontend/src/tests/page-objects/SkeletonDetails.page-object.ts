import type { PageObjectElement } from "$tests/types/page-object.types";
<<<<<<< HEAD
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class SkeletonDetailsPo extends BasePageObject {
  static readonly tid = "skeleton-details-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SkeletonDetailsPo | null {
    return new SkeletonDetailsPo(
      element.querySelector(`[data-tid=${SkeletonDetailsPo.tid}]`)
    );
=======

export class SkeletonDetailsPo {
  static readonly tid = "skeleton-details-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): SkeletonDetailsPo | null {
    const el = element.querySelector(`[data-tid=${SkeletonDetailsPo.tid}]`);
    return el && new SkeletonDetailsPo(el);
>>>>>>> main
  }
}
