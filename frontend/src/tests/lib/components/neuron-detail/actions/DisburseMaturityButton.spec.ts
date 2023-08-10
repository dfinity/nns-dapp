/**
 * @jest-environment jsdom
 */

import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("DisburseMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders disburse maturity cta", () => {
    const { getByText } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });

    expect(getByText(en.neuron_detail.disburse_maturity)).toBeInTheDocument();
  });

  it("should be enabled", async () => {
    const { getByTestId } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: true,
      },
    });

    const button = getByTestId("disburse-maturity-button");
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  });

  it("should be disabled", async () => {
    const { getByTestId } = render(DisburseMaturityButton, {
      props: {
        enoughMaturity: false,
      },
    });

    const btn = getByTestId("disburse-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
