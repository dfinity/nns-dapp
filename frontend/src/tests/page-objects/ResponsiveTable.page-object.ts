import { ResponsiveTableRowPo } from "$tests/page-objects/ResponsiveTableRow.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ResponsiveTablePo extends BasePageObject {
  private static readonly RESPONSIVE_TABLE_TID = "responsive-table-component";

  static under(element: PageObjectElement): ResponsiveTablePo {
    return new ResponsiveTablePo(
      element.byTestId(ResponsiveTablePo.RESPONSIVE_TABLE_TID)
    );
  }

  async getColumnHeaders(): Promise<string[]> {
    return Promise.all(
      (await this.root.querySelectorAll("[role='columnheader']")).map((el) =>
        el.getText()
      )
    );
  }

  async getColumnHeaderAlignments(): Promise<string[]> {
    return (
      await Promise.all(
        (await this.root.querySelectorAll("[role='columnheader']")).map((el) =>
          el.getClasses()
        )
      )
    ).map((classes) =>
      classes.filter((c) => c.startsWith("desktop-align-")).join(" ")
    );
  }

  getRows(): Promise<ResponsiveTableRowPo[]> {
    return ResponsiveTableRowPo.allUnder(this.root);
  }

  getStyle(): Promise<string> {
    return this.root.getAttribute("style");
  }

  async getStyleVariable(varName: string): Promise<string> {
    const style = await this.getStyle();
    const match = style.match(new RegExp(`--${varName}: ([^;]+)`));
    if (!match) {
      throw new Error(`Could not find --${varName} in style attribute`);
    }
    return match[1];
  }

  getDesktopGridTemplateColumns(): Promise<string> {
    return this.getStyleVariable("desktop-grid-template-columns");
  }

  getMobileGridTemplateAreas(): Promise<string> {
    return this.getStyleVariable("mobile-grid-template-areas");
  }
}
