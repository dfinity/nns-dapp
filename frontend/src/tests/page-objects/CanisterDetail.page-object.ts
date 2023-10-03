import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";
import { CanisterPageHeadingPo } from "./CanisterPageHeading.page-object";
import { RenameCanisterModalPo } from "./RenameCanisterModal.page-object";

export class CanisterDetailPo extends BasePageObject {
  private static readonly TID = "canister-detail-component";

  static under(element: PageObjectElement): CanisterDetailPo {
    return new CanisterDetailPo(element.byTestId(CanisterDetailPo.TID));
  }

  getRenameButtonPo(): ButtonPo {
    return this.getButton("rename-canister-button-component");
  }

  clickRename(): Promise<void> {
    return this.getRenameButtonPo().click();
  }

  getRenameCanisterModalPo(): RenameCanisterModalPo {
    return RenameCanisterModalPo.under(this.root);
  }

  async renameCanister(newName: string): Promise<void> {
    await this.getRenameCanisterModalPo().rename(newName);
  }

  getCanisterPageHeading(): CanisterPageHeadingPo {
    return CanisterPageHeadingPo.under(this.root);
  }

  async getTitle(): Promise<string> {
    return this.getCanisterPageHeading().getTitle();
  }

  async getSubtitle(): Promise<string> {
    return this.getCanisterPageHeading().getSubtitle();
  }

  async hasSubtitle(): Promise<boolean> {
    return this.getCanisterPageHeading().hasSubtitle();
  }
}
