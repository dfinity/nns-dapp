/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import SelectCyclesCanister from "../../../../lib/components/canisters/SelectCyclesCanister.svelte";
import { getIcpToCyclesExchangeRate } from "../../../../lib/services/canisters.services";
import { clickByTestId } from "../../../lib/testHelpers/clickByTestId";
import en from "../../../mocks/i18n.mock";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(10_000)),
  };
});

describe("SelectCyclesCanister", () => {
  it("renders message", () => {
    const { queryByText } = render(SelectCyclesCanister);

    expect(queryByText(en.canisters.minimum_cycles_text)).toBeInTheDocument();
  });

  it("renders two inputs", () => {
    const { container } = render(SelectCyclesCanister);

    expect(container.querySelectorAll("input").length).toBe(2);
  });

  it("synchronizes icp input to tCycles input", async () => {
    const { container } = render(SelectCyclesCanister);
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const icpInputElement = container.querySelector<HTMLInputElement>(
      'input[name="icp-amount"]'
    );
    expect(icpInputElement).not.toBeNull();
    const tCyclesInputElement = container.querySelector<HTMLInputElement>(
      'input[name="t-cycles-amount"]'
    );
    expect(tCyclesInputElement).not.toBeNull();

    const value = 2;
    // Inputs are synchronized when they are focused
    icpInputElement && fireEvent.focus(icpInputElement);
    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value },
      }));

    await waitFor(
      () =>
        tCyclesInputElement &&
        expect(tCyclesInputElement.value).toBe(String(value))
    );
  });

  it("synchronizes tCycles input to icp input", async () => {
    const { container } = render(SelectCyclesCanister);
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const icpInputElement = container.querySelector<HTMLInputElement>(
      'input[name="icp-amount"]'
    );
    expect(icpInputElement).not.toBeNull();
    const tCyclesInputElement = container.querySelector<HTMLInputElement>(
      'input[name="t-cycles-amount"]'
    );
    expect(tCyclesInputElement).not.toBeNull();

    const value = 2;
    // Inputs are synchronized when they are focused
    tCyclesInputElement && fireEvent.focus(tCyclesInputElement);
    tCyclesInputElement &&
      (await fireEvent.input(tCyclesInputElement, {
        target: { value },
      }));

    await waitFor(
      () => icpInputElement && expect(icpInputElement.value).toBe(String(value))
    );
  });

  it("dispatches nnsSelectAmount event on click", async () => {
    const { container, component, queryByTestId } =
      render(SelectCyclesCanister);

    const icpInputElement = container.querySelector<HTMLInputElement>(
      'input[name="icp-amount"]'
    );
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: 2 },
      }));

    const fn = jest.fn();
    component.$on("nnsSelectAmount", fn);
    await clickByTestId(queryByTestId, "select-cycles-button");

    await waitFor(() => expect(fn).toBeCalled());
  });
});
