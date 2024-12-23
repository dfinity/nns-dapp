import { CalloutWarningPo } from "$tests/page-objects/CalloutWarning.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddUserToHotkeysPo extends BasePageObject {
  private static readonly TID = "add-principal-to-hotkeys-modal";

  static under(element: PageObjectElement): AddUserToHotkeysPo | null {
    return new AddUserToHotkeysPo(element.byTestId(AddUserToHotkeysPo.TID));
  }

  isMissingRewardsWarningVisible(): Promise<boolean> {
    return CalloutWarningPo.under(this.root).isPresent();
  }

  clickSkip(): Promise<void> {
    return this.click("skip-add-principal-to-hotkey-modal");
  }

  clickAddHotkey(): Promise<void> {
    return this.click("confirm-add-principal-to-hotkey-modal");
  }
}
