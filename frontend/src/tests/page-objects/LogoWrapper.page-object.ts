import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LogoWrapperPo extends BasePageObject {
  private static readonly LOGO_WRAPPER_TID = "logo-wrapper-component";
  private static readonly CUSTOM_SIZES = ["huge", "big", "medium"];
  private static readonly DEFAULT_SIZE = "small";

  static under(element: PageObjectElement): LogoWrapperPo {
    return new LogoWrapperPo(element.byTestId(LogoWrapperPo.LOGO_WRAPPER_TID));
  }

  async isFramed(): Promise<boolean> {
    const classes = await this.root.getClasses();
    return classes.includes("framed");
  }

  async getSize(): Promise<string> {
    const classes = await this.root.getClasses();
    return (
      classes.filter((c) => LogoWrapperPo.CUSTOM_SIZES.includes(c))[0] ??
      LogoWrapperPo.DEFAULT_SIZE
    );
  }
}
