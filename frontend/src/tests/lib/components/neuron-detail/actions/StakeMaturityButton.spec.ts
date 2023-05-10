import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("StakeMaturityButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders stake maturity cta", () => {
    const { getByText } = render(StakeMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });

    expect(getByText(en.neuron_detail.stake_maturity)).toBeInTheDocument();
  });

  it("should be enabled", async () => {
    const { getByTestId } = render(StakeMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });

    const button = getByTestId("stake-maturity-button");
    await waitFor(() => expect(button.hasAttribute("disabled")).toBeFalsy());
  });

  it("should be disabled", async () => {
    const { getByTestId } = render(StakeMaturityButton, {
      props: {
        enoughMaturity: false,
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
