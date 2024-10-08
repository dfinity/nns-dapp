import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  SnsNeuronPermissionType,
  type SnsNervousSystemFunction,
  type SnsNeuron,
} from "@dfinity/sns";

describe("SnsNeuronFollowingCard", () => {
  beforeAll(() => {
    resetIdentity();
  });

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
      id: 0n,
      name: "function0",
    };
    const function1: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: 1n,
      name: "function1",
    };
    const function2: SnsNervousSystemFunction = {
      ...nervousSystemFunctionMock,
      id: 2n,
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

    const reload = vi.fn();
    const renderCard = (neuron: SnsNeuron) =>
      renderSelectedSnsNeuronContext({
        reload,
        Component: SnsNeuronFollowingCard,
        neuron,
      });

    beforeEach(() => {
      vi.clearAllMocks();
      resetSnsProjects();
    });

    it("renders followees and their topics", () => {
      // Use same rootCanisterId as in `renderSelectedSnsNeuronContext`
      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdMock,
          nervousFunctions: [function0, function1, function2],
        },
      ]);
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
      resetSnsProjects();
      const { queryByTestId } = renderCard(neuronWithFollowees);
      expect(queryByTestId("skeleton-followees")).toBeInTheDocument();
    });

    it("does not render skeletong if no followees", () => {
      resetSnsProjects();
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

    const reload = vi.fn();
    const renderCard = (neuron: SnsNeuron) =>
      renderSelectedSnsNeuronContext({
        reload,
        Component: SnsNeuronFollowingCard,
        neuron,
      });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("does not render button to follow neurons", () => {
      const { queryByTestId } = renderCard(uncontrolledNeuron);

      expect(
        queryByTestId("sns-follow-neurons-button")
      ).not.toBeInTheDocument();
    });
  });
});
