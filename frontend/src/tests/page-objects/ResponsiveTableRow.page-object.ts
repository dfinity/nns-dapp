import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class ResponsiveTableRowPo extends BasePageObject {
  private static readonly TID = "responsive-table-row-component";

  static async allUnder(
    element: PageObjectElement
  ): Promise<ResponsiveTableRowPo[]> {
    return Array.from(await element.allByTestId(ResponsiveTableRowPo.TID)).map(
      (el) => new ResponsiveTableRowPo(el)
    );
  }

  getHref(): Promise<string | null> {
    return this.root.getAttribute("href");
  }

  async getCells(): Promise<string[]> {
    return Promise.all(
      (await this.root.querySelectorAll("[role='cell']")).map((el) =>
        el.getText()
      )
    );
  }

  async getCellStyles(): Promise<string[]> {
    return Promise.all(
      (await this.root.querySelectorAll("[role='cell']")).map((el) =>
        el.getAttribute("style")
      )
    );
  }

  async getTagName(): Promise<string> {
    return this.root.getTagName();
  }
}
