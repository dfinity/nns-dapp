/**
 * @jest-environment jsdom
 */

import NnsDestinationAddress from "$lib/components/accounts/NnsDestinationAddress.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { NnsDestinationAddressPo } from "$tests/page-objects/NnsDestinationAddress.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("NnsDestinationAddress", () => {
  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: `test-subaccount2-identifier`,
  };

  let onAccountSelectedSpy: jest.Mock;

  beforeEach(() => {
    jest
      .spyOn(icpAccountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([mockSubAccount, mockSubAccount2])
      );
    onAccountSelectedSpy = jest.fn();
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

    expect(await po.getNnsSelectAccountPo().isPresent()).toBe(true);
  });

  it("should render a list of accounts", async () => {
    const po = renderComponent();
    const selectPo = po.getNnsSelectAccountPo();

    expect(
      await (
        await selectPo.getAccountCardPoForIdentifier(mockSubAccount.identifier)
      ).isPresent()
    ).toBe(true);
    expect(
      await (
        await selectPo.getAccountCardPoForIdentifier(mockSubAccount2.identifier)
      ).isPresent()
    ).toBe(true);
  });

  it("should dispatch event with selected account identifier", async () => {
    const po = renderComponent();
    const card = await po
      .getNnsSelectAccountPo()
      .getAccountCardPoForIdentifier(mockSubAccount2.identifier);

    expect(onAccountSelectedSpy).not.toBeCalled();
    await card.click();
    expect(onAccountSelectedSpy).toBeCalledWith({
      address: mockSubAccount2.identifier,
    });
    expect(onAccountSelectedSpy).toBeCalledTimes(1);
  });

  it("should dispatch event with entered account identifier", async () => {
    const po = renderComponent();
    await po.enterAddress(mockSubAccount.identifier);

    expect(onAccountSelectedSpy).not.toBeCalled();

    await po.clickContinue();

    expect(onAccountSelectedSpy).toBeCalledWith({
      address: mockSubAccount.identifier,
    });
    expect(onAccountSelectedSpy).toBeCalledTimes(1);
  });
});
