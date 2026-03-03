import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("StakeMaturityButton", () => {
  it("renders stake maturity cta", () => {
    const { getByText } = render(StakeMaturityButton, {
      props: {
        disabledText: undefined,
      },
    });

    expect(getByText(en.neuron_detail.stake_maturity)).toBeInTheDocument();
  });

  it("should be enabled when no disabledText", async () => {
    const { getByTestId } = render(StakeMaturityButton, {
      props: {
        disabledText: undefined,
      },
    });

    const button = getByTestId("stake-maturity-button");
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  });

  it("should be disabled when disabledText is provided", async () => {
    const { getByTestId } = render(StakeMaturityButton, {
      props: {
        disabledText: "Some reason",
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
