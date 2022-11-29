/**
 * @jest-environment jsdom
 */

import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { dispatchIntersecting } from "$lib/directives/intersection.directives";
import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
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

  const renderSnsNeuronCmp = () =>
    renderSelectedSnsNeuronContext({
      Component: SnsNeuronMetaInfoCard,
      neuron: mockSnsNeuron,
      reload: jest.fn(),
    });

  const hash = shortenWithMiddleEllipsis(
    `${getSnsNeuronIdAsHexString(mockSnsNeuron) ?? ""}`
  );

  it("should render neuron id", () => {
    const { getByTestId } = renderSnsNeuronCmp();

    expect(getByTestId("neuron-id")?.textContent.trim()).toEqual(hash);
  });

  it("should render neuron state", () => {
    const { getByTestId } = renderSnsNeuronCmp();

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

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = renderSnsNeuronCmp();

    const element = getByTestId("neuron-id-container") as HTMLElement;

    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() => expect(title).toEqual(text));
  };

  it("should render a title with neuron ID if title is not intersecting viewport", () =>
    testTitle({ intersecting: false, text: hash }));

  it("should render a static title if title is intersecting viewport", () =>
    testTitle({ intersecting: true, text: en.neuron_detail.title }));
});
