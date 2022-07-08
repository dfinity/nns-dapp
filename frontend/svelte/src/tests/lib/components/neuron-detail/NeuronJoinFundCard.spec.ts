/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronJoinFundCard from "../../../../lib/components/neuron-detail/NeuronJoinFundCard.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronJoinFundCard", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockMainAccount.principal?.toText() as string,
    },
  };
  const props = {
    neuron,
  };

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
  });

  it("renders join community fund checkbox", () => {
    // Checkbox is tested separately
    const { queryByTestId } = render(NeuronJoinFundCard, {
      props,
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox if user is not controller", () => {
    const props = {
      neuron: {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-controller",
        },
      },
    };

    const { queryByTestId } = render(NeuronJoinFundCard, {
      props,
    });

    expect(queryByTestId("checkbox")).not.toBeInTheDocument();
  });
});
