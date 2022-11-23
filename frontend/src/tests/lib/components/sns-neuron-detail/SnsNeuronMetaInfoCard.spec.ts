/**
 * @jest-environment jsdom
 */

import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { authStore } from "$lib/stores/auth.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsNeuron,
} from "../../../mocks/sns-neurons.mock";
import { mockTokenStore } from "../../../mocks/sns-projects.mock";

describe("SnsNeuronMetaInfoCard", () => {
  beforeEach(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render neuron id", () => {
    const { getByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronMetaInfoCard,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

    const hash = shortenWithMiddleEllipsis(
      `${getSnsNeuronIdAsHexString(mockSnsNeuron) ?? ""}`
    );
    expect(getByTestId("neuron-id")?.textContent.trim()).toEqual(hash);
  });

  it("should render neuron state", () => {
    const { getByTestId } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronMetaInfoCard,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

    expect(getByTestId("neuron-state-info")?.textContent.trim()).toEqual(
      en.neuron_state.Dissolved
    );
  });

  // TODO: uncomment for display neuron age
  // it("should render neuron age", () => {
  //   const { getByTestId } = renderSelectedSnsNeuronContext({
  //     Component: SnsNeuronMetaInfoCard,
  //     neuron: mockSnsNeuron,
  //     reload: jest.fn(),
  //   });
  //
  //   expect(getByTestId("sns-neuron-age")?.textContent.trim()).toEqual(
  //     secondsToDuration(BigInt(mockSnsNeuronTimestampSeconds))
  //   );
  // });
});
