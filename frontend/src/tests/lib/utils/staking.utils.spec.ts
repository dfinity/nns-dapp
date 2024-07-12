import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Universe } from "$lib/types/universe";
import { getTableProjects } from "$lib/utils/staking.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
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

    it("should return an array of TableProject objects", () => {
      const universes: Universe[] = [nnsUniverse, snsUniverse];

      const tableProjects = getTableProjects({
        universes,
        nnsNeurons: [],
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
        nnsNeurons: [mockNeuron, mockNeuron, mockNeuron],
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
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [mockSnsNeuron, mockSnsNeuron],
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
  });
});
