import { AddCyclesModalPo } from "$tests/page-objects/AddCyclesModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CanisterPageHeadingPo } from "$tests/page-objects/CanisterPageHeading.page-object";
import { RenameCanisterModalPo } from "$tests/page-objects/RenameCanisterModal.page-object";

export class CanisterDetailPo extends BasePageObject {
  private static readonly TID = "canister-detail-component";

  static under(element: PageObjectElement): CanisterDetailPo {
    return new CanisterDetailPo(element.byTestId(CanisterDetailPo.TID));
  }

  getRenameButtonPo(): ButtonPo {
    return this.getButton("rename-canister-button-component");
  }

  getAddCyclesButtonPo(): ButtonPo {
    return this.getButton("add-cycles-button");
  }

  clickRename(): Promise<void> {
    return this.getRenameButtonPo().click();
  }

  getRenameCanisterModalPo(): RenameCanisterModalPo {
    return RenameCanisterModalPo.under(this.root);
  }

  getAddCyclesModalPo(): AddCyclesModalPo {
    return AddCyclesModalPo.under(this.root);
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

  async addCycles({ icpAmount }: { icpAmount: string }): Promise<void> {
    await this.getAddCyclesButtonPo().click();
    const modal = this.getAddCyclesModalPo();
    await modal.addCycles({ icpAmount });
    await modal.waitForClosed();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.getText("canister-details-error-card")).trim();
  }
}
