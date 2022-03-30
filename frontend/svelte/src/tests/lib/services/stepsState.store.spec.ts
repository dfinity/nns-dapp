import { StepsState } from "../../../lib/stores/steps.state";

describe("StepsState", () => {
  enum Steps {
    FirstStep,
    SecondStep,
    ThirdStep,
  }

  it("initialize state to 0", async () => {
    const setpsState = new StepsState(Steps);

    expect(setpsState.currentStepIndex).toBe(0);
    expect(setpsState.previousStepIndex).toBe(0);
  });

  it("update methods return the instance", async () => {
    const setpsState = new StepsState(Steps);

    expect(setpsState.next()).toBe(setpsState);
    expect(setpsState.back()).toBe(setpsState);
  });

  it("it should move to next, back and reset", async () => {
    const setpsState = new StepsState(Steps);

    setpsState.next();

    expect(setpsState.currentStepIndex).toBe(1);
    expect(setpsState.previousStepIndex).toBe(0);

    setpsState.next();

    expect(setpsState.currentStepIndex).toBe(2);
    expect(setpsState.previousStepIndex).toBe(1);

    setpsState.back();

    expect(setpsState.currentStepIndex).toBe(1);
    expect(setpsState.previousStepIndex).toBe(2);
  });

  it("it should move further than steps", async () => {
    const setpsState = new StepsState(Steps);

    setpsState.next();

    expect(setpsState.currentStepIndex).toBe(1);
    expect(setpsState.previousStepIndex).toBe(0);

    setpsState.next();

    expect(setpsState.currentStepIndex).toBe(2);
    expect(setpsState.previousStepIndex).toBe(1);

    // No more steps
    setpsState.next();

    expect(setpsState.currentStepIndex).toBe(2);
    expect(setpsState.previousStepIndex).toBe(1);
  });

  it("it should not go less than zero", async () => {
    const setpsState = new StepsState(Steps);

    expect(setpsState.currentStepIndex).toBe(0);
    expect(setpsState.previousStepIndex).toBe(0);

    setpsState.back();

    expect(setpsState.currentStepIndex).toBe(0);
    expect(setpsState.previousStepIndex).toBe(0);
  });

  it("it should be able to set to a specific step", async () => {
    const setpsState = new StepsState(Steps);

    expect(setpsState.currentStepIndex).toBe(0);
    expect(setpsState.previousStepIndex).toBe(0);

    setpsState.set(Steps.ThirdStep);

    expect(setpsState.currentStepIndex).toBe(2);
    expect(setpsState.previousStepIndex).toBe(0);
  });
});
