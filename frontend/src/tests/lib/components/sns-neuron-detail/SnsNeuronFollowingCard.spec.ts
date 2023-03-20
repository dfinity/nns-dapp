/**
 * @jest-environment jsdom
 */

import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
import { authStore } from "$lib/stores/auth.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {
  SnsNeuronPermissionType,
  type SnsNervousSystemFunction,
  type SnsNeuron,
} from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/$public/sns.services", () => ({
  loadSnsNervousSystemFunctions: jest.fn(),
}));

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
      followees: [],
    };
    const function0: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(0),
      name: "function0",
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(1),
      name: "function1",
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: BigInt(2),
      name: "function2",
    };
    const followee1 = createMockSnsNeuron({
      id: [1, 2, 3, 4],
    });
    const followee2 = createMockSnsNeuron({
      id: [5, 6, 7, 8],
    });
    const neuronWithFollowees: SnsNeuron = {
      ...mockSnsNeuron,
      followees: [
        [function0.id, { followees: [followee1.id[0]] }],
        [function1.id, { followees: [followee2.id[0]] }],
        [function2.id, { followees: [followee1.id[0], followee2.id[0]] }],
      ],
    };

    const reload = jest.fn();
    const renderCard = (neuron: SnsNeuron) =>
      renderSelectedSnsNeuronContext({
        reload,
        Component: SnsNeuronFollowingCard,
        neuron,
      });

    afterEach(() => {
      jest.clearAllMocks();
      snsFunctionsStore.reset();
    });

    it("loads sns topics", async () => {
      renderCard(controlledNeuron);

      await waitFor(() =>
        expect(loadSnsNervousSystemFunctions).toHaveBeenCalled()
      );
    });

    it("renders followees and their topics", () => {
      // Use same rootCanisterId as in `renderSelectedSnsNeuronContext`
      snsFunctionsStore.setProjectFunctions({
        rootCanisterId: rootCanisterIdMock,
        nsFunctions: [function0, function1, function2],
        certified: true,
      });
      const { getAllByText } = renderCard(neuronWithFollowees);

      [followee1, followee2].forEach((followee) => {
        expect(
          getAllByText(
            shortenWithMiddleEllipsis(getSnsNeuronIdAsHexString(followee))
          ).length
        ).toBe(2);
      });

      // 1 followee
      expect(getAllByText(function0.name).length).toBe(1);
      // 1 followee
      expect(getAllByText(function1.name).length).toBe(1);
      // 2 followees
      expect(getAllByText(function2.name).length).toBe(2);
    });

    it("shows loading while no ns functions", () => {
      snsFunctionsStore.reset();
      const { queryByTestId } = renderCard(neuronWithFollowees);
      expect(queryByTestId("skeleton-followees")).toBeInTheDocument();
    });

    it("does not render skeletong if no followees", () => {
      snsFunctionsStore.reset();
      const { queryByTestId } = renderCard(controlledNeuron);
      expect(queryByTestId("skeleton-followees")).not.toBeInTheDocument();
    });

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

    it("loads sns topics", async () => {
      renderCard(uncontrolledNeuron);

      await waitFor(() =>
        expect(loadSnsNervousSystemFunctions).toHaveBeenCalled()
      );
    });

    it("does not render button to follow neurons", () => {
      const { queryByTestId } = renderCard(uncontrolledNeuron);

      expect(
        queryByTestId("sns-follow-neurons-button")
      ).not.toBeInTheDocument();
    });
  });
});
