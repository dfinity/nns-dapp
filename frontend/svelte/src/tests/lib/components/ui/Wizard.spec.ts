/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import WizardTest from "./WizardTest.svelte";

describe("Wizard", () => {
  it("should render the first WizardPanel with 0 index", () => {
    const { queryByText } = render(WizardTest, {
      props: { selectedTabIndex: 0 },
    });

    expect(queryByText("First")).not.toBeNull();
    expect(queryByText("Second")).toBeNull();
  });

  it("should render the second WizardPanel with 1 index", () => {
    const { queryByText } = render(WizardTest, {
      props: { selectedTabIndex: 1 },
    });

    expect(queryByText("First")).toBeNull();
    expect(queryByText("Second")).not.toBeNull();
  });

  it("should render the second WizardPanel and move to the third", () => {
    const { queryByText, rerender } = render(WizardTest, {
      props: { selectedTabIndex: 1 },
    });

    expect(queryByText("Second")).not.toBeNull();
    expect(queryByText("Third")).toBeNull();

    rerender({ props: { selectedTabIndex: 2 } });

    expect(queryByText("Second")).toBeNull();
    expect(queryByText("Third")).not.toBeNull();
  });
});
