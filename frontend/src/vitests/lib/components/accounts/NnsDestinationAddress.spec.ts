import NnsDestinationAddress from "$lib/components/accounts/NnsDestinationAddress.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { NnsDestinationAddressPo } from "$tests/page-objects/NnsDestinationAddress.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { render } from "@testing-library/svelte";
import type { Mock } from "vitest";

describe("NnsDestinationAddress", () => {
  const mockSubAccount1 = {
    ...mockSubAccount,
    name: "Subaccount1",
    identifier:
      "b505b85da7d92b7d72e48a38edb31a2a8e1f28bb0d5432a3d6e24aae798b5136",
  };

  const mockSubAccount2 = {
    ...mockSubAccount,
    name: "Subaccount2",
    identifier:
      "72c0fde366c2ae6128591316d66429b99373bd2e5485aa07224a7b3f6fbe7104",
  };

  let onAccountSelectedSpy: Mock;

  beforeEach(() => {
    allowLoggingInOneTestForDebugging();
    vi.restoreAllMocks();

    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount1, mockSubAccount2],
      hardwareWallets: [],
    });
    onAccountSelectedSpy = vi.fn();
  });

  const renderComponent = () => {
    const { container, component } = render(NnsDestinationAddress);
    component.$on("nnsAddress", (event) => {
      onAccountSelectedSpy(event.detail);
    });
    return NnsDestinationAddressPo.under(new JestPageObjectElement(container));
  };

  it("should render an input to enter an address", async () => {
    const po = renderComponent();

    expect(await po.getSelectDestinationAddressPo().isPresent()).toBe(true);
  });

  it("should render a list of accounts", async () => {
    const po = renderComponent();

    expect(await po.getOptions()).toEqual([
      "Main",
      mockSubAccount1.name,
      mockSubAccount2.name,
    ]);
  });

  it("should dispatch event with selected account identifier", async () => {
    const po = renderComponent();

    await po
      .getSelectDestinationAddressPo()
      .getDropdownPo()
      .select(mockSubAccount2.name);

    expect(onAccountSelectedSpy).not.toBeCalled();
    await po.clickContinue();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onAccountSelectedSpy).toBeCalledWith({
      address: mockSubAccount2.identifier,
    });
    expect(onAccountSelectedSpy).toBeCalledTimes(1);
  });

  it("should dispatch event with entered account identifier", async () => {
    const po = renderComponent();
    await po.getSelectDestinationAddressPo().toggleSelect();
    await po.enterAddress(mockSubAccount.identifier);

    expect(onAccountSelectedSpy).not.toBeCalled();

    await po.clickContinue();

    expect(onAccountSelectedSpy).toBeCalledWith({
      address: mockSubAccount.identifier,
    });
    expect(onAccountSelectedSpy).toBeCalledTimes(1);
  });
});
