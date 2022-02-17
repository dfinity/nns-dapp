import { initWizardStore, State } from "../../../lib/stores/wizard.store";

describe("WizardStore", () => {
  it("initialize state to 0", async () => {
    const store = initWizardStore();

    store.subscribe((state) => {
      expect(state.currentIndex).toBe(0);
      expect(state.previousIndex).toBe(0);
    });
  });

  it("it should move to next, back and reset", async () => {
    const store = initWizardStore();

    let state: State | undefined;
    store.subscribe((currentState) => {
      state = currentState;
    });

    store.next();

    expect(state.currentIndex).toBe(1);
    expect(state.previousIndex).toBe(0);

    store.next();

    expect(state.currentIndex).toBe(2);
    expect(state.previousIndex).toBe(1);

    store.back();

    expect(state.currentIndex).toBe(1);
    expect(state.previousIndex).toBe(2);

    store.reset();
    expect(state.currentIndex).toBe(0);
    expect(state.previousIndex).toBe(0);
  });
});
