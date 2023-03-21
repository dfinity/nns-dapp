export class SkeletonCardPo {
  static readonly tid = "skeleton-card";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static allUnder(element: Element): SkeletonCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SkeletonCardPo.tid}]`)
    ).map((el) => new SkeletonCardPo(el));
  }
}
