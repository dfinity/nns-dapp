export class ButtonPo {
  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under({
    element,
    testId,
  }: {
    element: Element;
    testId: string;
  }): ButtonPo | null {
    const el = element.querySelector(`button[data-tid=${testId}]`);
    return el && new ButtonPo(el);
  }
}
