import { ConfirmCyclesCanisterPo } from "$tests/page-objects/ConfirmCyclesCanister.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { SelectCyclesCanisterPo } from "$tests/page-objects/SelectCyclesCanister.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddCyclesModalPo extends ModalPo {
  private static readonly TID = "add-cycles-modal-component";

  static under(element: PageObjectElement): AddCyclesModalPo {
    return new AddCyclesModalPo(element.byTestId(AddCyclesModalPo.TID));
  }

  getSelectCyclesCanisterPo(): SelectCyclesCanisterPo {
    return SelectCyclesCanisterPo.under(this.root);
  }

  getConfirmCyclesCanisterPo(): ConfirmCyclesCanisterPo {
    return ConfirmCyclesCanisterPo.under(this.root);
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

  async addCycles({ icpAmount }: { icpAmount: number }): Promise<void> {
    await this.enterIcpAmount(icpAmount.toString());
    await this.clickReview();
    await this.clickConfirm();
  }
}
