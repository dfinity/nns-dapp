import { LogoWrapperPo } from "$tests/page-objects/LogoWrapper.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LogoPo extends LogoWrapperPo {
  private static readonly TID = "logo-component";

  static under(element: PageObjectElement): LogoPo {
    return new LogoPo(element.byTestId(LogoPo.TID));
  }

  getSource(): Promise<string> {
    return this.root.getAttribute("src");
  }
}
