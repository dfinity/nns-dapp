import { NnsSelectAccountPo } from "$tests/page-objects/NnsSelectAccount.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsDestinationAddressPo extends BasePageObject {
  private static readonly TID = "nns-destination-address-component";

  static under(element: PageObjectElement): NnsDestinationAddressPo {
    return new NnsDestinationAddressPo(
      element.byTestId(NnsDestinationAddressPo.TID)
    );
  }

  getNnsSelectAccountPo(): NnsSelectAccountPo {
    return NnsSelectAccountPo.under(this.root);
  }

  selectMainAccount(): Promise<void> {
    return this.getNnsSelectAccountPo().selectMainAccount();
  }
}
