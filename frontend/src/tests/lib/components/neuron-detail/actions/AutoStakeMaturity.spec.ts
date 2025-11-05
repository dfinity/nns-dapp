import AutoStakeMaturity from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";
import { render } from "@testing-library/svelte";

describe("AutoStakeMaturity", () => {
  it("renders checkbox", () => {
    const { queryByTestId } = render(AutoStakeMaturity, {
      props: {
        hasAutoStakeOn: true,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const testCheckBox = (hasAutoStakeOn: boolean | undefined) => {
    const { queryByTestId } = render(AutoStakeMaturity, {
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

  it("doesn't render tooltip if checkbox is enabled", () => {
    const { queryByTestId } = render(AutoStakeMaturity, {
      props: {
        hasAutoStakeOn: true,
        disabled: false,
      },
    });
    const tooltip = queryByTestId("auto-stake-maturity-tooltip");
    expect(tooltip).not.toBeInTheDocument();
  });
  it("renders tooltip if checkbox is disabled", () => {
    const { queryByTestId } = render(AutoStakeMaturity, {
      props: {
        hasAutoStakeOn: true,
        disabled: true,
      },
    });
    const tooltip = queryByTestId("auto-stake-maturity-tooltip");
    expect(tooltip).toBeInTheDocument();
  });
});
