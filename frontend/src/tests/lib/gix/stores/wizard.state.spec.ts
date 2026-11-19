import { WizardStepsState } from "$lib/gix/stores/wizard.state";
import type { WizardSteps } from "$lib/gix/types/wizard";
import { wizardStepIndex } from "$lib/gix/utils/wizard.utils";

describe("StepsState", () => {
  const steps: WizardSteps = [
    { name: "FirstStep", title: "FirstStep" },
    { name: "SecondStep", title: "SecondStep" },
    { name: "ThirdStep", title: "ThirdStep" },
  ];

  it("initialize state to 0", () => {
    const stepsState = new WizardStepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);
  });

  it("update methods return the instance", () => {
    const stepsState = new WizardStepsState(steps);

    expect(stepsState.next()).toBe(stepsState);
    expect(stepsState.back()).toBe(stepsState);
  });

  it("should move to next, back and reset", () => {
    const stepsState = new WizardStepsState(steps);

    stepsState.next();

    expect(stepsState.currentStepIndex).toBe(1);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[1]);

    stepsState.next();

    expect(stepsState.currentStepIndex).toBe(2);
    expect(stepsState.previousStepIndex).toBe(1);
    expect(stepsState.currentStep).toEqual(steps[2]);

    stepsState.back();

    expect(stepsState.currentStepIndex).toBe(1);
    expect(stepsState.previousStepIndex).toBe(2);
    expect(stepsState.currentStep).toEqual(steps[1]);
  });

  it("should move further than steps", () => {
    const stepsState = new WizardStepsState(steps);

    stepsState.next();

    expect(stepsState.currentStepIndex).toBe(1);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[1]);

    stepsState.next();

    expect(stepsState.currentStepIndex).toBe(2);
    expect(stepsState.previousStepIndex).toBe(1);
    expect(stepsState.currentStep).toEqual(steps[2]);

    // No more steps
    stepsState.next();

    expect(stepsState.currentStepIndex).toBe(2);
    expect(stepsState.previousStepIndex).toBe(1);
    expect(stepsState.currentStep).toEqual(steps[2]);
  });

  it("should not go less than zero", () => {
    const stepsState = new WizardStepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);

    stepsState.back();

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);
  });

  it("should be able to set to a specific step", () => {
    const stepsState = new WizardStepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);

    stepsState.set(wizardStepIndex({ name: "ThirdStep", steps }));

    expect(stepsState.currentStepIndex).toBe(2);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[2]);
  });
});
