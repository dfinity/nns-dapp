import { enumSize } from "../utils/enum.utils";

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

  public set(newStep: number): StepsState<EnumType> {
    this.previousStep = this.currentStep;
    this.currentStep = newStep;
    return this;
  }
}
