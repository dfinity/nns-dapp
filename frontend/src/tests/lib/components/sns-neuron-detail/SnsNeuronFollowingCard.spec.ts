import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { SnsNeuronFollowingCardPo } from "$tests/page-objects/SnsNeuronFollowingCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  SnsNeuronPermissionType,
  type SnsNervousSystemFunction,
  type SnsNeuron,
} from "@dfinity/sns";

describe("SnsNeuronFollowingCard", () => {
  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
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

    const renderComponent = (neuron: SnsNeuron) => {
      const { container } = renderCard(neuron);
      return SnsNeuronFollowingCardPo.under(
        new JestPageObjectElement(container)
      );
    };

    it("renders followees and their topics", async () => {
      // Use same rootCanisterId as in `renderSelectedSnsNeuronContext`
      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdMock,
          nervousFunctions: [function0, function1, function2],
        },
      ]);
      const po = renderComponent(neuronWithFollowees);
      const followeePos = await po.getSnsFolloweePos();

      expect(followeePos.length).toBe(2);

      const tags1 = await followeePos[0].getTagPos();
      expect(await Promise.all(tags1.map((tag) => tag.getText()))).toEqual([
        function0.name,
        function2.name,
      ]);

      const tags2 = await followeePos[1].getTagPos();
      expect(await Promise.all(tags2.map((tag) => tag.getText()))).toEqual([
        function1.name,
        function2.name,
      ]);
    });

    it("shows loading while no ns functions", async () => {
      resetSnsProjects();
      const po = renderComponent(neuronWithFollowees);

      expect(await po.hasSkeletonFollowees()).toBe(true);
    });

    it("does not render skeletong if no followees", async () => {
      resetSnsProjects();
      const po = renderComponent(controlledNeuron);

      expect(await po.hasSkeletonFollowees()).toBe(false);
    });

    it("renders button to follow neurons", async () => {
      const po = renderComponent(controlledNeuron);

      expect(await po.getFollowSnsNeuronsButtonPo().isPresent()).toBe(true);
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

    const renderComponent = (neuron: SnsNeuron) => {
      const { container } = renderCard(neuron);
      return SnsNeuronFollowingCardPo.under(
        new JestPageObjectElement(container)
      );
    };

    it("does not render button to follow neurons", async () => {
      const po = renderComponent(uncontrolledNeuron);

      expect(await po.getFollowSnsNeuronsButtonPo().isPresent()).toBe(false);
    });
  });
});
