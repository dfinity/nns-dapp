import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "./Button.page-object";
import { RenameCanisterModalPo } from "./RenameCanisterModal.page-object";

export class CanisterDetailPo extends BasePageObject {
  private static readonly TID = "canister-detail-component";

  static under(element: PageObjectElement): CanisterDetailPo {
    return new CanisterDetailPo(element.byTestId(CanisterDetailPo.TID));
  }

  getRenameButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "rename-canister-button-component",
    });
  }

  clickRename(): Promise<void> {
    return this.getRenameButtonPo().click();
  }

  getRenameCanisterModalPo(): RenameCanisterModalPo {
    return RenameCanisterModalPo.under(this.root);
  }

  async renameCanister(newName: string): Promise<void> {
    await this.getRenameCanisterModalPo().enterName(newName);
    await this.getRenameCanisterModalPo().clickRenameButton();
    await this.getRenameCanisterModalPo().waitForAbsent();
  }

  async getCanisterTitle(): Promise<string> {
    return (
      await this.root.byTestId("canister-card-title-compoment").getText()
    ).trim();
  }
}
