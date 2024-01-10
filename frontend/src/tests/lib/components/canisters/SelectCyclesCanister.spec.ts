import SelectCyclesCanister from "$lib/components/canisters/SelectCyclesCanister.svelte";
import en from "$tests/mocks/i18n.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import SelectCyclesCanisterTest from "./SelectCyclesCanisterTest.svelte";

vitest.mock("$lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: vitest.fn().mockResolvedValue(10_000n),
  };
});

describe("SelectCyclesCanister", () => {
  const props = { icpToCyclesExchangeRate: 10_000n };
  it("renders button", () => {
    const { queryByText } = render(SelectCyclesCanisterTest, { props });

    expect(
      queryByText(en.canisters.review_cycles_purchase)
    ).toBeInTheDocument();
  });

  it("should have a submit button disabled per default", () => {
    const { getByTestId } = render(SelectCyclesCanisterTest, { props });

    expect(
      getByTestId("select-cycles-button").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("renders two inputs", () => {
    const { container } = render(SelectCyclesCanister, { props });

    expect(container.querySelectorAll("input").length).toBe(2);
  });

  it("synchronizes icp input to tCycles input", async () => {
    const { container } = render(SelectCyclesCanister, { props });

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
    const { container } = render(SelectCyclesCanister, { props });

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
    const { container, component, queryByTestId } = render(
      SelectCyclesCanister,
      { props }
    );

    const icpInputElement = container.querySelector<HTMLInputElement>(
      'input[name="icp-amount"]'
    );
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: 2 },
      }));

    const fn = vitest.fn();
    component.$on("nnsSelectAmount", fn);
    await clickByTestId(queryByTestId, "select-cycles-button");

    await waitFor(() => expect(fn).toBeCalled());
  });
});
