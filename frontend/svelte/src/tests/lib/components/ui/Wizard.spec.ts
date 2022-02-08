/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import WizardTest from "./WizardTest.svelte";

describe("Wizard", () => {
  it("should render the first WizardStep with 0 index", () => {
    const { queryByText } = render(WizardTest, {
      props: { selectedStepIndex: 0 },
    });

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should render the second WizardStep with 1 index", () => {
    const { queryByText } = render(WizardTest, {
      props: { selectedStepIndex: 1 },
    });

    expect(queryByText("First")).toBeNull();
    expect(queryByText("Second")).not.toBeNull();
  });

  it("should render the second WizardStep and move to the third", () => {
    const { queryByText, rerender } = render(WizardTest, {
      props: { selectedStepIndex: 1 },
    });

    expect(queryByText("Second")).not.toBeNull();
    expect(queryByText("Third")).toBeNull();

    rerender({ props: { selectedStepIndex: 2 } });

    expect(queryByText("Second")).toBeNull();
    expect(queryByText("Third")).not.toBeNull();
  });
});
