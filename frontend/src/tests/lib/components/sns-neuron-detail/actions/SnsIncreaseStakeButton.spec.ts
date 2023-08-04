/**
 * @jest-environment jsdom
 */

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
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsIncreaseStakeButton", () => {
  beforeAll(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);

    jest
      .spyOn(snsProjectSelectedStore, "subscribe")
      .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

    jest
      .spyOn(snsSelectedTransactionFeeStore, "subscribe")
      .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    fireEvent.click(
      getByTestId("increase-stake-button-component") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(getByText(en.neurons.top_up_neuron)).toBeInTheDocument()
    );
  });
});
