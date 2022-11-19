/**
 * @jest-environment jsdom
 */

import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../../mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "../../../mocks/context-wrapper.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("SnsNeuronFollowingCard", () => {
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  describe("user has permissions to manage followees", () => {
    const controlledNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [mockPrincipal],
          permission_type: Int32Array.from([
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          ]),
        },
      ],
    };

    const reload = jest.fn();
    const renderCard = (neuron: SnsNeuron) =>
      renderSelectedSnsNeuronContext({
        reload,
        Component: SnsNeuronFollowingCard,
        neuron,
      });

    afterEach(() => jest.clearAllMocks());

    it("renders button to follow neurons", () => {
      const { queryByTestId } = renderCard(controlledNeuron);

      expect(queryByTestId("sns-follow-neurons-button")).toBeInTheDocument();
    });
  });

  describe("user does not have permissions to manage followees", () => {
    const uncontrolledNeuron: SnsNeuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [mockPrincipal],
          permission_type: Int32Array.from([]),
        },
      ],
    };

    const reload = jest.fn();
    const renderCard = (neuron: SnsNeuron) =>
      renderSelectedSnsNeuronContext({
        reload,
        Component: SnsNeuronFollowingCard,
        neuron,
      });

    afterEach(() => jest.clearAllMocks());

    it("does not render button to follow neurons", () => {
      const { queryByTestId } = renderCard(uncontrolledNeuron);

      expect(
        queryByTestId("sns-follow-neurons-button")
      ).not.toBeInTheDocument();
    });
  });
});
