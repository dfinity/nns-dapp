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

  getDesktopColumnHeaderElements(): Promise<PageObjectElement[]> {
    return this.root.querySelectorAll(
      "[role='columnheader']:not(.mobile-only)"
    );
  }

  async getDesktopColumnHeaders(): Promise<string[]> {
    return Promise.all(
      (await this.getDesktopColumnHeaderElements()).map((el) => el.getText())
    );
  }

  async getMobileColumnHeaders(): Promise<string[]> {
    return Promise.all(
      (
        await this.root.querySelectorAll(
          "[role='columnheader']:not(.desktop-only)"
        )
      ).map((el) => el.getText())
    );
  }

  async getColumnHeaderAlignments(): Promise<string[]> {
    return (
      await Promise.all(
        (await this.getDesktopColumnHeaderElements()).map((el) =>
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

  async clickColumnHeader(title: string): Promise<void> {
    const columnHeaderElements = await this.getDesktopColumnHeaderElements();
    const titles = await Promise.all(
      columnHeaderElements.map((el) => el.getText())
    );
    const index = titles.indexOf(title);
    if (index === -1) {
      throw new Error(
        `Could not find column header with title "${title}". Found: ${titles.join(
          ", "
        )}`
      );
    }
    await columnHeaderElements[index].click();
  }

  async getColumnHeaderWithArrow(): Promise<string | undefined> {
    const columnHeaderElements = await this.getDesktopColumnHeaderElements();
    for (const el of columnHeaderElements) {
      const arrow = el.querySelector("span.order-arrow");
      if (await arrow.isPresent()) {
        const direction = (await arrow.querySelector(".reversed").isPresent())
          ? " reversed"
          : "";
        return `${await el.getText()}${direction}`;
      }
    }
  }
}
