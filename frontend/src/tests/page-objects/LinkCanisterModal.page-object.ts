import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LinkCanisterModalPo extends ModalPo {
  private static readonly TID = "link-canister-modal-component";

  static under(element: PageObjectElement): LinkCanisterModalPo {
    return new LinkCanisterModalPo(element.byTestId(LinkCanisterModalPo.TID));
  }

  getCanisterIdInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "canister-id-input",
    });
  }

  getCanisterNameInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "canister-name-input",
    });
  }

  enterCanisterId(id: string): Promise<void> {
    return this.getCanisterIdInputPo().typeText(id);
  }

  enterName(name: string): Promise<void> {
    return this.getCanisterNameInputPo().typeText(name);
  }

  clickConfirm(): Promise<void> {
    return this.click("link-canister-button");
  }

  async linkCanister({
    canisterId,
    name,
  }: {
    canisterId: string;
    name: string;
  }): Promise<void> {
    await this.enterCanisterId(canisterId);
    await this.enterName(name);
    await this.clickConfirm();
  }
}
