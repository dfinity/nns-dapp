import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";
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

  async getCanisterTitle(): Promise<string> {
    return (
      await this.root.byTestId("canister-card-title-compoment").getText()
    ).trim();
  }
}
