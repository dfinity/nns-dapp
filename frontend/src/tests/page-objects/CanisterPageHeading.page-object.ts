import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { CanisterHeadingTitlePo } from "./CanisterHeadingTitle.page-object";

export class CanisterPageHeadingPo extends BasePageObject {
  private static readonly TID = "canister-page-heading-component";

  static under(element: PageObjectElement): CanisterPageHeadingPo {
    return new CanisterPageHeadingPo(
      element.byTestId(CanisterPageHeadingPo.TID)
    );
  }

  getCanisterHeadingTitlePo(): CanisterHeadingTitlePo {
    return CanisterHeadingTitlePo.under(this.root);
  }

  hasTitle(): Promise<boolean> {
    return this.getCanisterHeadingTitlePo().isPresent();
  }

  getTitle(): Promise<string | null> {
    return this.getCanisterHeadingTitlePo().getTitle();
  }

  hasSubtitle(): Promise<boolean> {
    return this.root.byTestId("subtitle").isPresent();
  }

  getSubtitle(): Promise<string | null> {
    return this.root.byTestId("subtitle").getText();
  }

  clickUnlink(): Promise<void> {
    return this.getButton("unlink-canister-button").click();
  }

  clickRename(): Promise<void> {
    return this.getButton("rename-canister-button-component").click();
  }
}
