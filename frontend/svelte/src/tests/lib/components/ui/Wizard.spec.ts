/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { wizardStore } from "../../../../lib/components/ui/Wizard/wizardStore";
import WizardTest from "./WizardTest.svelte";

describe("Wizard", () => {
  it("should render the first WizardStep by default", () => {
    const { queryByText } = render(WizardTest);

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should render move to the second WizardStep on next and back to First on back", async () => {
    const { queryByText } = render(WizardTest);

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();

    wizardStore.next();
    // query was not waiting for store to update
    await tick();

    expect(queryByText("First")).toBeNull();
    expect(queryByText("Second")).not.toBeNull();

    wizardStore.back();
    await tick();

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should reset the store when unmounted", async () => {
    const { unmount } = render(WizardTest);

    const spy = jest.spyOn(wizardStore, "reset");
    expect(spy).not.toHaveBeenCalled();

    unmount();

    expect(spy).toHaveBeenCalled();
  });
});
