/**
 * @jest-environment jsdom
 */

import AutoStakeMaturityCheckbox from "$lib/components/neuron-detail/actions/AutoStakeMaturityCheckbox.svelte";
import { render } from "@testing-library/svelte";

describe("AutoStakeMaturityCheckbox", () => {
  it("renders checkbox", () => {
    const { queryByTestId } = render(AutoStakeMaturityCheckbox, {
      props: {
        hasAutoStakeOn: true,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const testCheckBox = (hasAutoStakeOn: boolean | undefined) => {
    const { queryByTestId } = render(AutoStakeMaturityCheckbox, {
      props: {
        hasAutoStakeOn,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    if (hasAutoStakeOn === true) {
      expect(inputElement.checked).toBeTruthy();
      return;
    }

    expect(inputElement.checked).toBe(false);
  };

  it("renders checked if auto stake already on", () => testCheckBox(true));

  it("renders unchecked if auto stake already false", () =>
    testCheckBox(false));

  it("renders unchecked if auto stake is undefined", () =>
    testCheckBox(undefined));
});
