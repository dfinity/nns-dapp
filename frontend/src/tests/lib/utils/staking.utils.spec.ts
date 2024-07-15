import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Universe } from "$lib/types/universe";
import { getTableProjects } from "$lib/utils/staking.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";

describe("staking.utils", () => {
  describe("getTableProjects", () => {
    const universeId2 = principal(2).toText();

    const nnsUniverse = {
      canisterId: OWN_CANISTER_ID_TEXT,
      title: "Internet Computer",
      logo: IC_LOGO_ROUNDED,
    };

    const snsUniverse = {
      canisterId: universeId2,
      title: "title2",
      logo: "logo2",
    };

    const defaultExpectedNnsTableProject = {
      rowHref: `/neurons/?u=${OWN_CANISTER_ID_TEXT}`,
      domKey: OWN_CANISTER_ID_TEXT,
      title: "Internet Computer",
      logo: IC_LOGO_ROUNDED,
      neuronCount: 0,
    };

    const defaultExpectedSnsTableProject = {
      rowHref: `/neurons/?u=${universeId2}`,
      domKey: universeId2,
      title: "title2",
      logo: "logo2",
      neuronCount: 0,
    };

    const snsNeuronWithStake = createMockSnsNeuron({
      stake: 100_000_000n,
      id: [1, 1, 3],
    });

    const snsNeuronWithoutStake = createMockSnsNeuron({
      stake: 0n,
      maturity: 0n,
      id: [7, 7, 9],
    });

    it("should return an array of TableProject objects", () => {
      const universes: Universe[] = [nnsUniverse, snsUniverse];

      const tableProjects = getTableProjects({
        universes,
        definedNnsNeurons: [],
        snsNeurons: {},
      });

      expect(tableProjects).toEqual([
        defaultExpectedNnsTableProject,
        defaultExpectedSnsTableProject,
      ]);
    });

    it("should include number of NNS neurons", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        definedNnsNeurons: [mockNeuron, mockNeuron, mockNeuron],
        snsNeurons: {},
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          neuronCount: 3,
        },
      ]);
    });

    it("should include number of SNS neurons", () => {
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        definedNnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [snsNeuronWithStake, snsNeuronWithStake],
          },
        },
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: 2,
        },
      ]);
    });

    it("should filter SNS neurons without stake", () => {
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        definedNnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [
              snsNeuronWithStake,
              snsNeuronWithoutStake,
              snsNeuronWithoutStake,
              snsNeuronWithoutStake,
            ],
          },
        },
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: 1,
        },
      ]);
    });
  });
});
