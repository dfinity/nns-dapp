import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import type { UniverseCanisterId } from "$lib/types/universe";
import {
  mockBTCAddressMainnet,
  mockBTCAddressTestnet,
  mockCkBTCAddress,
} from "$tests/mocks/ckbtc-accounts.mock";
import { SelectNetworkDropdownPo } from "$tests/page-objects/SelectNetworkDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get, writable, type Writable } from "svelte/store";

describe("SelectNetworkDropdown", () => {
  const props = { universeId: CKBTC_UNIVERSE_CANISTER_ID };

  const renderComponent = ({
    universeId,
    selectedDestinationAddress,
    selectedNetwork,
  }: {
    universeId: UniverseCanisterId;
    selectedDestinationAddress?: string;
    selectedNetwork?: Writable<TransactionNetwork>;
  }) => {
    const { container, component } = render(SelectNetworkDropdown, {
      props: {
        universeId,
        selectedDestinationAddress,
        selectedNetwork: get(selectedNetwork),
      },
    });

    const updateSelectedNetwork = () => {
      selectedNetwork.set(
        component.$$.ctx[component.$$.props["selectedNetwork"]]
      );
    };

    if (selectedNetwork) {
      component.$$.update = updateSelectedNetwork;
      updateSelectedNetwork();
    }

    selectedNetwork?.subscribe((network) => {
      component.$set({ selectedNetwork: network });
    });

    return SelectNetworkDropdownPo.under(new JestPageObjectElement(container));
  };

  it("should render a select component", async () => {
    const po = renderComponent(props);

    expect(await po.isPresent()).toBe(true);
  });

  it("should display a disable placeholder", async () => {
    const po = renderComponent(props);

    expect(await po.isDisabled(0)).toBe(true);
    expect(await po.getOptionValue(0)).toBe("");
  });

  it("should display an option to select ICP", async () => {
    const po = renderComponent(props);

    expect(await po.getOption(1)).toBe("Internet Computer");
    expect(await po.isDisabled(1)).toBe(false);
    expect(await po.getOptionValue(1)).toBe("network_icp");
  });

  it("should display an option to select bitcoin", async () => {
    const po = renderComponent(props);

    expect(await po.getOption(2)).toBe("Bitcoin");
    expect(await po.isDisabled(2)).toBe(false);
    expect(await po.getOptionValue(2)).toBe("network_btc_mainnet");
  });

  it("should bind select to selected network", async () => {
    const selectedNetwork = writable<TransactionNetwork>(undefined);
    const po = renderComponent({
      ...props,
      selectedNetwork,
    });

    expect(get(selectedNetwork)).toBe(undefined);
    await po.select("Internet Computer");
    expect(get(selectedNetwork)).toBe(TransactionNetwork.ICP);
  });

  it("should auto select ICP network", async () => {
    const selectedNetwork = writable<TransactionNetwork>(undefined);
    renderComponent({
      ...props,
      selectedDestinationAddress: mockCkBTCAddress,
      selectedNetwork,
    });

    expect(get(selectedNetwork)).toBe(TransactionNetwork.ICP);
  });

  it("should auto select BTC testnet network", async () => {
    const selectedNetwork = writable<TransactionNetwork>(undefined);
    renderComponent({
      ...props,
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      selectedDestinationAddress: mockBTCAddressTestnet,
      selectedNetwork,
    });

    expect(get(selectedNetwork)).toBe(TransactionNetwork.BTC_TESTNET);
  });

  it("should auto select BTC mainnet network", async () => {
    const selectedNetwork = writable<TransactionNetwork>(undefined);
    renderComponent({
      ...props,
      selectedDestinationAddress: mockBTCAddressMainnet,
      selectedNetwork,
    });

    expect(get(selectedNetwork)).toBe(TransactionNetwork.BTC_MAINNET);
  });

  it("should auto not select BTC mainnet network", async () => {
    const selectedNetwork = writable<TransactionNetwork>(
      TransactionNetwork.ICP
    );
    renderComponent({
      ...props,
      selectedDestinationAddress: mockBTCAddressMainnet,
      selectedNetwork,
    });

    expect(get(selectedNetwork)).toBe(TransactionNetwork.ICP);
  });
});
