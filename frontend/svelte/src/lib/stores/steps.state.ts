export interface Step {
  name: string;
  showBackButton: boolean;
}

export class StepsState {
  public currentStep = 0;
  public previousStep = 0;
  private readonly steps: Step[];

  constructor(steps: [Step, ...Step[]]) {
    this.steps = steps;
  }

  public next(): StepsState {
    if (this.currentStep < this.steps.length - 1) {
      this.move(this.currentStep + 1);
    }
    return this;
  }

  public get diff(): number {
    return this.currentStep - this.previousStep;
  }

  public back(): StepsState {
    if (this.currentStep > 0) {
      this.move(this.currentStep - 1);
    }
    return this;
  }

  public set(newStep: number): StepsState {
    this.move(newStep);
    return this;
  }

  private move(nextStep: number) {
    this.previousStep = this.currentStep;
    this.currentStep = nextStep;
  }
}
