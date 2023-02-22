/**
 * @jest-environment jsdom
 */

import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
import { render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";

describe("StakeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
