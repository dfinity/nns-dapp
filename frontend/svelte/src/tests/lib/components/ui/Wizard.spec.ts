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
    // sometimes next line is faster than rerendering
    await tick();

    expect(queryByText("First")).toBeNull();
    expect(queryByText("Second")).not.toBeNull();

    wizardStore.back();
    await tick();

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should reset the store when unmounted", async () => {
    const { queryByText, unmount } = render(WizardTest);
    let currentIndex: number;
    wizardStore.subscribe((value) => (currentIndex = value));

    wizardStore.next();
    wizardStore.next();
    await tick();

    expect(queryByText("Third")).not.toBeNull();
    expect(currentIndex).toEqual(2);

    const spy = jest.spyOn(wizardStore, "reset");
    expect(spy).not.toHaveBeenCalled();

    unmount();

    expect(spy).toHaveBeenCalled();
    expect(currentIndex).toEqual(0);
  });
});
