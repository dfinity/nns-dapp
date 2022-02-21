function enumSize<EnumType>(enm: EnumType): number {
  return Object.values(enm).filter(isNaN).length;
}

export class StepsState<EnumType> {
  public currentStep = 0;
  public previousStep = 0;
  private steps: EnumType;

  constructor(steps: EnumType) {
    this.steps = steps;
  }

  public next(): StepsState<EnumType> {
    if (this.currentStep < enumSize(this.steps) - 1) {
      this.previousStep = this.currentStep;
      this.currentStep = this.currentStep + 1;
    }
    return this;
  }

  public get diff(): number {
    return this.currentStep - this.previousStep;
  }

  public back(): StepsState<EnumType> {
    if (this.currentStep > 0) {
      this.previousStep = this.currentStep;
      this.currentStep = this.currentStep - 1;
    }
    return this;
  }
}
