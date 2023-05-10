import NeuronJoinFundCard from "$lib/components/neuron-detail/NeuronJoinFundCard.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
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
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    vi.spyOn(accountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
    );
  });

  it("renders join community fund checkbox", () => {
    // Checkbox is tested separately
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox if user is not controller", () => {
    const { queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            controller: "not-controller",
          },
        },
        testComponent: NeuronJoinFundCard,
      },
    });

    expect(queryByTestId("checkbox")).not.toBeInTheDocument();
  });
});
