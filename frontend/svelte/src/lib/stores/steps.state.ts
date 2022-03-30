export interface Step {
  name: string;
  showBackButton: boolean;
}

export class StepsState {
  public currentStep: Step | undefined;
  public currentStepIndex = 0;
  public previousStepIndex = 0;
  private readonly steps: Step[];

  constructor(steps: [Step, ...Step[]]) {
    this.steps = steps;
  }

  public next(): StepsState {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.move(this.currentStepIndex + 1);
    }
    return this;
  }

  public get diff(): number {
    return this.currentStepIndex - this.previousStepIndex;
  }

  public back(): StepsState {
    if (this.currentStepIndex > 0) {
      this.move(this.currentStepIndex - 1);
    }
    return this;
  }

  public set(newStep: number): StepsState {
    this.move(newStep);
    return this;
  }

  private move(nextStep: number) {
    this.previousStepIndex = this.currentStepIndex;
    this.currentStepIndex = nextStep;
    this.currentStep = this.steps[this.currentStepIndex];
  }
}
