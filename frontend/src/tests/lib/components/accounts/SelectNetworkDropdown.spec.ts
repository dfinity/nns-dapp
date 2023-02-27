/**
 * @jest-environment jsdom
 */

import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";

describe("SelectNetworkDropdown", () => {
  const props = { props: { universeId: CKBTC_UNIVERSE_CANISTER_ID } };

  it("should display a network title", () => {
    const { getByText } = render(SelectNetworkDropdown, props);

    expect(getByText(en.accounts.network)).toBeInTheDocument();
  });

  it("should render a select component", () => {
    const { getByTestId } = render(SelectNetworkDropdown, props);

    expect(getByTestId("select-network-dropdown")).not.toBeNull();
  });

  it("should display a disable placeholder", () => {
    const { container } = render(SelectNetworkDropdown, props);

    const option = container.querySelector("option[disabled]");

    expect(option).not.toBeNull();
    expect(option?.getAttribute("value")).toEqual("undefined");
  });

  it("should display an option to select ICP", () => {
    const { container } = render(SelectNetworkDropdown, props);

    const option = container.querySelector("option[value='network_icp_ckbtc']");

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_icp_ckbtc);
  });

  it("should display an option to select bitcoin", () => {
    const { container } = render(SelectNetworkDropdown, props);

    const option = container.querySelector("option[value='network_bitcoin']");

    expect(option).not.toBeNull();
    expect(option.innerHTML).toEqual(en.accounts.network_bitcoin);
  });

  it("should bind select to selected network", async () => {
    const { getByTestId, component, container } = render(
      SelectNetworkDropdown,
      props
    );

    const optionDefault = container.querySelector("option[disabled]");
    expect(optionDefault).not.toBeNull();

    const selectElement = getByTestId(
      "select-network-dropdown"
    ) as HTMLSelectElement | null;
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: TransactionNetwork.ICP_CKBTC },
      });

    await waitFor(() =>
      expect(component.$$.ctx[component.$$.props["selectedNetwork"]]).toEqual(
        TransactionNetwork.ICP_CKBTC
      )
    );
  });
});
