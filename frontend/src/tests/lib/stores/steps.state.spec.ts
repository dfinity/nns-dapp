import type { Steps } from "../../../lib/stores/steps.state";
import { StepsState } from "../../../lib/stores/steps.state";
import { stepIndex } from "../../../lib/utils/step.utils";

describe("StepsState", () => {
  const steps: Steps = [
    { name: "FirstStep", showBackButton: false, title: "FirstStep" },
    { name: "SecondStep", showBackButton: true, title: "SecondStep" },
    { name: "ThirdStep", showBackButton: true, title: "ThirdStep" },
  ];

  it("initialize state to 0", () => {
    const stepsState = new StepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);
  });

  it("update methods return the instance", () => {
    const stepsState = new StepsState(steps);

    expect(stepsState.next()).toBe(stepsState);
    expect(stepsState.back()).toBe(stepsState);
  });

  it("it should move to next, back and reset", () => {
    const stepsState = new StepsState(steps);

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

  it("it should move further than steps", () => {
    const stepsState = new StepsState(steps);

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

  it("it should not go less than zero", () => {
    const stepsState = new StepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);

    stepsState.back();

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);
  });

  it("it should be able to set to a specific step", () => {
    const stepsState = new StepsState(steps);

    expect(stepsState.currentStepIndex).toBe(0);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[0]);

    stepsState.set(stepIndex({ name: "ThirdStep", steps }));

    expect(stepsState.currentStepIndex).toBe(2);
    expect(stepsState.previousStepIndex).toBe(0);
    expect(stepsState.currentStep).toEqual(steps[2]);
  });
});
