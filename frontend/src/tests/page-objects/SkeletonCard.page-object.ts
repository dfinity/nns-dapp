export class SkeletonCardPo {
  static readonly tid = "skeleton-card";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("testId") !== SkeletonCardPo.tid) {
      throw new Error(`${root} is not a SkeletonCard`);
    }
    this.root = root;
  }

  static allUnder(element: Element): SkeletonCardPo[] {
    return Array.from(
      element.querySelectorAll(`[testId=${SkeletonCardPo.tid}]`)
    ).map((el) => new SkeletonCardPo(el));
  }
}
