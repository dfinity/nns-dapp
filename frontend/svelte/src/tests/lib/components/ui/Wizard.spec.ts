/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import WizardTest from "./WizardTest.svelte";

describe("Wizard", () => {
  it("should render the first WizardStep by default", () => {
    const { queryByText } = render(WizardTest);

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should render move to the second WizardStep on next and back to First on back", async () => {
    const { queryByText, component } = render(WizardTest);

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();

    component.next();
    // query was not waiting for store to update
    await tick();

    expect(queryByText("First")).toBeNull();
    expect(queryByText("Second")).not.toBeNull();

    component.back();
    await tick();

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });
});
