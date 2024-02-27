import { ConfirmCyclesCanisterPo } from "$tests/page-objects/ConfirmCyclesCanister.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { SelectCyclesCanisterPo } from "$tests/page-objects/SelectCyclesCanister.page-object";
import { TextInputFormPo } from "$tests/page-objects/TextInputForm.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CreateCanisterModalPo extends ModalPo {
  private static readonly TID = "create-canister-modal-component";

  static under(element: PageObjectElement): CreateCanisterModalPo {
    return new CreateCanisterModalPo(
      element.byTestId(CreateCanisterModalPo.TID)
    );
  }

  getTextInputFormPo(): TextInputFormPo {
    return TextInputFormPo.under({
      element: this.root,
      testId: "create-canister-name-form",
    });
  }

  getSelectCyclesCanisterPo(): SelectCyclesCanisterPo {
    return SelectCyclesCanisterPo.under(this.root);
  }

  getConfirmCyclesCanisterPo(): ConfirmCyclesCanisterPo {
    return ConfirmCyclesCanisterPo.under(this.root);
  }

  enterName(name: string): Promise<void> {
    return this.getTextInputFormPo().enterText(name);
  }

  clickNext(): Promise<void> {
    return this.getTextInputFormPo().clickSubmitButton();
  }

  enterIcpAmount(amount: string): Promise<void> {
    return this.getSelectCyclesCanisterPo().enterIcpAmount(amount);
  }

  clickReview(): Promise<void> {
    return this.getSelectCyclesCanisterPo().clickSubmit();
  }

  clickConfirm(): Promise<void> {
    return this.getConfirmCyclesCanisterPo().clickConfirm();
  }

  async createCanister({
    name,
    icpAmount,
  }: {
    name: string;
    icpAmount: string;
  }): Promise<void> {
    await this.enterName(name);
    await this.clickNext();
    await this.enterIcpAmount(icpAmount);
    await this.clickReview();
    await this.clickConfirm();
  }
}
