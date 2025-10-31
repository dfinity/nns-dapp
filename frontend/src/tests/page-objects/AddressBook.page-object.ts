import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ResponsiveTablePo } from "$tests/page-objects/ResponsiveTable.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddressBookPo extends BasePageObject {
  private static readonly TID = "address-book-content";

  static under(element: PageObjectElement): AddressBookPo {
    return new AddressBookPo(element.byTestId(AddressBookPo.TID));
  }

  getAddAddressButtonPo(): ButtonPo {
    return this.getButton("add-address-button");
  }

  clickAddAddress(): Promise<void> {
    return this.getAddAddressButtonPo().click();
  }

  isAddAddressButtonDisabled(): Promise<boolean> {
    return this.getAddAddressButtonPo().isDisabled();
  }

  getResponsiveTablePo(): ResponsiveTablePo {
    return ResponsiveTablePo.under(this.root);
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }

  async isContentLoaded(): Promise<boolean> {
    return (await this.isPresent()) && !(await this.hasSpinner());
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.waitForAbsent("spinner");
  }

  async hasEmptyState(): Promise<boolean> {
    const element = await this.root.querySelector(".is-empty");
    return element.isPresent();
  }

  async getTableRowsData(): Promise<
    Array<{ nickname: string; address: string }>
  > {
    const table = this.getResponsiveTablePo();
    const rows = await table.getRows();

    return Promise.all(
      rows.map(async (row) => {
        const cellElements = await row.root.querySelectorAll(
          "[role='cell'] .cell-body"
        );
        const nickname = (await cellElements[0].getText()).trim();
        const address = (await cellElements[1].getText()).trim();
        return { nickname, address };
      })
    );
  }

  async getRowCount(): Promise<number> {
    const rows = await this.getResponsiveTablePo().getRows();
    return rows.length;
  }
}
