import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LinkToCanistersPo extends LinkPo {
  private static readonly TID = "canisters-button";

  static override under({
    element,
    testId = LinkToCanistersPo.TID,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): LinkToCanistersPo {
    return new LinkToCanistersPo(element.byTestId(testId));
  }

  async hasIcon(): Promise<boolean> {
    const iconElement = this.root.querySelector("svg");
    return iconElement !== null;
  }
}
