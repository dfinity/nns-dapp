import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class ResponsiveTableRowPo extends BasePageObject {
  static readonly TID = "responsive-table-row-component";

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

  async getCellAlignments(): Promise<string[]> {
    return (
      await Promise.all(
        (await this.root.querySelectorAll("[role='cell']")).map((el) =>
          el.getClasses()
        )
      )
    ).map((classes) =>
      classes.filter((c) => c.startsWith("desktop-align-")).join(" ")
    );
  }

  async getCellClasses(): Promise<string[][]> {
    return Promise.all(
      (await this.root.querySelectorAll("[role='cell']")).map((el) =>
        el.getClasses()
      )
    );
  }

  async getTagName(): Promise<string> {
    return this.root.getTagName();
  }

  async getStyleVariable(varName: string): Promise<string> {
    const style = await this.getStyle();
    const match = style && style.match(new RegExp(`--${varName}: ([^;]+)`));
    if (!match) {
      return "";
    }
    return match[1];
  }

  async getTableRowTextColorVariable(): Promise<string> {
    return this.getStyleVariable("table-row-text-color");
  }

  async getTableRowTooltipColorVariable(): Promise<string> {
    return this.getStyleVariable("elements-icons");
  }
}
