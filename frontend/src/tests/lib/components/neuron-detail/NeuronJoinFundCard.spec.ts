/**
 * @jest-environment jsdom
 */

import NeuronJoinFundCard from "$lib/components/neuron-detail/NeuronJoinFundCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NeuronJoinFundCard", () => {
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

  it("renders join community fund checkbox if user is controller", () => {
    // Checkbox is tested separately
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders join community fund checkbox if user is hotkey and controller not the hardware wallet", () => {
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: "not-user-nor-hw",
        hotKeys: [mockIdentity.getPrincipal().toText() as string],
      },
    };
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox if user is hotkey and controller is the hardware wallet", () => {
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
        hotKeys: [mockIdentity.getPrincipal().toText() as string],
      },
    };
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).not.toBeInTheDocument();
  });

  it("renders no checkbox if user is not controller nor hotkey", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            controller: "not-controller",
            hotKeys: [],
          },
        },
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).not.toBeInTheDocument();
  });
});
