function enumSize<EnumType>(enm: EnumType): number {
  return Object.values(enm).filter(isNaN).length;
}

export class StepsState<EnumType> {
  public currentIndex = 0;
  public previousIndex = 0;
  private steps: EnumType;

  constructor(steps: EnumType) {
    this.steps = steps;
  }

  public next(): StepsState<EnumType> {
    console.log(this.currentIndex);
    if (this.currentIndex < enumSize(this.steps) - 1) {
      this.previousIndex = this.currentIndex;
      this.currentIndex = this.currentIndex + 1;
    }
    return this;
  }

  public get diff(): number {
    return this.currentIndex - this.previousIndex;
  }

  public back(): StepsState<EnumType> {
    console.log(this.currentIndex);
    if (this.currentIndex > 0) {
      this.previousIndex = this.currentIndex;
      this.currentIndex = this.currentIndex - 1;
    }
    return this;
  }
}
