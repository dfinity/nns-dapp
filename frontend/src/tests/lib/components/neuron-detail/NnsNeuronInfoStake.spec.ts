/**
 * @jest-environment jsdom
 */

import NnsNeuronInfoStake from "$lib/components/neuron-detail/NnsNeuronInfoStake.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronInfoStake", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockMainAccount.principal?.toText() as string,
    },
  };

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(icpAccountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
  });

  it("renders actions", () => {
    // Each action button is tested separately
    const { queryByText } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronInfoStake,
      },
    });

    expect(
      queryByText(en.neuron_detail.increase_dissolve_delay)
    ).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.start_dissolving)).toBeInTheDocument();
    expect(queryByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
  });
});
