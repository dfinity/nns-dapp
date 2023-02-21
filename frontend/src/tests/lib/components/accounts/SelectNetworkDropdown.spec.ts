/**
 * @jest-environment jsdom
 */

import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { TransactionNetwork } from "../../../../lib/types/transaction";
import en from "../../../mocks/i18n.mock";
import SelectNetworkDropdownTest from "./SelectNetworkDropdownTest.svelte";

describe("SelectNetworkDropdown", () => {
  it("should display a network title", () => {
    const { getByText } = render(SelectNetworkDropdown);

    expect(getByText(en.accounts.network)).toBeInTheDocument();
  });

  it("should render a select component", () => {
    const { getByTestId } = render(SelectNetworkDropdown);

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
  });

  it("should display a disable placeholder", () => {
    const { container } = render(SelectNetworkDropdown);

    const option = container.querySelector("option[disabled]");

    expect(option).not.toBeNull();
    expect(option?.getAttribute("value")).toEqual("undefined");
  });

  it("should display an option to select ICP", () => {
    const { container } = render(SelectNetworkDropdown);

    const option = container.querySelector("option[value='network_icp_ckbtc']");

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_icp_ckbtc);
  });

  it("should display an option to select bitcoin", () => {
    const { container } = render(SelectNetworkDropdown);

    const option = container.querySelector("option[value='network_bitcoin']");

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_bitcoin);
  });

  it("should bind select to selected network", async () => {
    const { getByTestId, container } = render(SelectNetworkDropdownTest);

    const optionDefault = container.querySelector("option[disabled]");
    expect(optionDefault).not.toBeNull();

    const selectElement = getByTestId(
      "select-network-dropdown"
    ) as HTMLSelectElement | null;
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: TransactionNetwork.ICP_CKBTC },
      });

    const div = container.querySelector(".container");

    await waitFor(() =>
      expect(div.classList).toContain(TransactionNetwork.ICP_CKBTC)
    );
  });
});
