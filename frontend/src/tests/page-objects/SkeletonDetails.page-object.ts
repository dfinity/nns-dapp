import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SkeletonDetailsPo extends BasePageObject {
  static readonly tid = "skeleton-details-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SkeletonDetailsPo | null {
    return new SkeletonDetailsPo(element.byTestId(SkeletonDetailsPo.tid));
  }
}
