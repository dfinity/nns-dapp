import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CanisterHeadingTitlePo extends BasePageObject {
  private static readonly TID = "canister-heading-title-component";

  static under(element: PageObjectElement): CanisterHeadingTitlePo {
    return new CanisterHeadingTitlePo(
      element.byTestId(CanisterHeadingTitlePo.TID)
    );
  }

  hasSkeleton(): Promise<boolean> {
    return this.root.byTestId("skeleton").isPresent();
  }

  async getTitle(): Promise<string | null> {
    if (await this.hasSkeleton()) {
      return null;
    } else {
      return (await this.root.getText()).trim();
    }
  }
}
