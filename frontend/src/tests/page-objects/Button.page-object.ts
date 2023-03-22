import type { PageObjectElement } from "$tests/types/page-object.types";
export class ButtonPo {
  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): ButtonPo | null {
    const el = element.querySelector(`button[data-tid=${testId}]`);
    return el && new ButtonPo(el);
  }
}
