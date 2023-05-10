import SnsIncreaseStakeButton from "$lib/components/sns-neuron-detail/actions/SnsIncreaseStakeButton.svelte";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  mockSnsFullProject,
  mockTokenStore,
} from "$tests/mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsIncreaseStakeButton", () => {
  beforeAll(() => {
    vi.spyOn(snsTokenSymbolSelectedStore, "subscribe").mockImplementation(
      mockTokenStore
    );

    vi.spyOn(snsProjectSelectedStore, "subscribe").mockImplementation(
      mockStoreSubscribe(mockSnsFullProject)
    );

    vi.spyOn(snsSelectedTransactionFeeStore, "subscribe").mockImplementation(
      mockSnsSelectedTransactionFeeStoreSubscribe()
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should open increase stake neuron modal", async () => {
    const { getByText, getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsIncreaseStakeButton,
      },
    });

    fireEvent.click(getByTestId("sns-increase-stake") as HTMLButtonElement);

    await waitFor(() =>
      expect(getByText(en.neurons.top_up_neuron)).toBeInTheDocument()
    );
  });
});
