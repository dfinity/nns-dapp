import NnsNeuronInfoStake from "$lib/components/neuron-detail/NnsNeuronInfoStake.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
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
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    vi.spyOn(accountsStore, "subscribe").mockImplementation(
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
