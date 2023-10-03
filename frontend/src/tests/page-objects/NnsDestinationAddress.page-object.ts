import { SelectDestinationAddressPo } from "$tests/page-objects/SelectDestinationAddress.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsDestinationAddressPo extends BasePageObject {
  private static readonly TID = "nns-destination-address-component";

  static under(element: PageObjectElement): NnsDestinationAddressPo {
    return new NnsDestinationAddressPo(
      element.byTestId(NnsDestinationAddressPo.TID)
    );
  }

  getSelectDestinationAddressPo(): SelectDestinationAddressPo {
    return SelectDestinationAddressPo.under(this.root);
  }

  enterAddress(address: string): Promise<void> {
    return this.getSelectDestinationAddressPo().enterAddress(address);
  }

  clickContinue(): Promise<void> {
    return this.click("address-submit-button");
  }

  getOptions(): Promise<string[]> {
    return this.getSelectDestinationAddressPo().getOptions();
  }
}
