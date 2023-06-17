import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SkeletonDetailsPo extends BasePageObject {
  private static readonly TID = "skeleton-details-component";

  static under(element: PageObjectElement): SkeletonDetailsPo | null {
    return new SkeletonDetailsPo(element.byTestId(SkeletonDetailsPo.TID));
  }
}
