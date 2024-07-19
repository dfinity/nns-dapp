import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Universe } from "$lib/types/universe";
import { getTableProjects, sortTableProjects } from "$lib/utils/staking.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  mockSnsToken,
  mockSummary,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("staking.utils", () => {
  describe("getTableProjects", () => {
    const universeId2 = principal(2).toText();

    const nnsUniverse: Universe = {
      canisterId: OWN_CANISTER_ID_TEXT,
      title: "Internet Computer",
      logo: IC_LOGO_ROUNDED,
    };

    const snsUniverse: Universe = {
      canisterId: universeId2,
      title: "title2",
      logo: "logo2",
      summary: mockSummary.override({
        token: mockSnsToken,
      }),
    };

    const nnsHref = `/neurons/?u=${OWN_CANISTER_ID_TEXT}`;
    const snsHref = `/neurons/?u=${universeId2}`;

    const defaultExpectedNnsTableProject = {
      rowHref: nnsHref,
      domKey: OWN_CANISTER_ID_TEXT,
      title: "Internet Computer",
      logo: IC_LOGO_ROUNDED,
      neuronCount: 0,
      stake: TokenAmountV2.fromUlps({
        amount: 0n,
        token: ICPToken,
      }),
    };

    const defaultExpectedSnsTableProject = {
      rowHref: snsHref,
      domKey: universeId2,
      title: "title2",
      logo: "logo2",
      neuronCount: 0,
      stake: TokenAmountV2.fromUlps({
        amount: 0n,
        token: mockSnsToken,
      }),
    };

    const nnsNeuronWithStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 100_000_000n,
      },
    };

    const nnsNeuronWithoutStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 0n,
        maturityE8sEquivalent: 0n,
      },
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
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: { neurons: [] },
        },
      });

      expect(tableProjects).toEqual([
        defaultExpectedNnsTableProject,
        defaultExpectedSnsTableProject,
      ]);
    });

    it("should include info for NNS neurons", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        isSignedIn: true,
        nnsNeurons: [
          nnsNeuronWithStake,
          nnsNeuronWithStake,
          nnsNeuronWithStake,
        ],
        snsNeurons: {},
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          rowHref: nnsHref,
          neuronCount: 3,
          stake: TokenAmountV2.fromUlps({
            amount: 3n * nnsNeuronWithStake.fullNeuron.cachedNeuronStake,
            token: ICPToken,
          }),
        },
      ]);
    });

    it("should include info for SNS neurons", () => {
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [snsNeuronWithStake, snsNeuronWithStake],
          },
        },
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 2,
          stake: TokenAmountV2.fromUlps({
            amount: 2n * snsNeuronWithStake.cached_neuron_stake_e8s,
            token: mockSnsToken,
          }),
        },
      ]);
    });

    it("should filter NNS neurons without stake", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        isSignedIn: true,
        nnsNeurons: [
          nnsNeuronWithStake,
          nnsNeuronWithoutStake,
          nnsNeuronWithoutStake,
        ],
        snsNeurons: {},
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          rowHref: nnsHref,
          neuronCount: 1,
          stake: TokenAmountV2.fromUlps({
            amount: nnsNeuronWithStake.fullNeuron.cachedNeuronStake,
            token: ICPToken,
          }),
        },
      ]);
    });

    it("should filter SNS neurons without stake", () => {
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
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
          rowHref: snsHref,
          neuronCount: 1,
          stake: TokenAmountV2.fromUlps({
            amount: snsNeuronWithStake.cached_neuron_stake_e8s,
            token: mockSnsToken,
          }),
        },
      ]);
    });

    it("should not have a number of neurons when not signed in", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse, snsUniverse],
        isSignedIn: false,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [],
          },
        },
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          neuronCount: undefined,
          stake: undefined,
        },
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: undefined,
          stake: undefined,
        },
      ]);
    });

    it("should not have a number of neurons when not loaded into the store", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse, snsUniverse],
        isSignedIn: true,
        nnsNeurons: undefined,
        snsNeurons: {
          [universeId2]: undefined,
        },
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          neuronCount: undefined,
          stake: undefined,
        },
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: undefined,
          stake: undefined,
        },
      ]);
    });
  });

  describe("sortTableProjects", () => {
    const icpDomKey = OWN_CANISTER_ID_TEXT;
    const snsDomKey = principal(2).toText();

    const defaultProject = {
      ...mockTableProject,
      domKey: snsDomKey,
      neuronCount: 0,
    };

    it("should sort ICP first", () => {
      const icpProject = {
        ...defaultProject,
        domKey: icpDomKey,
        title: "Internet Computer",
        neuronCount: 0,
      };
      const snsProject = {
        ...defaultProject,
        domKey: snsDomKey,
        title: "AAA",
        neuronCount: 1,
      };
      expect(sortTableProjects([snsProject, icpProject])).toEqual([
        icpProject,
        snsProject,
      ]);
      expect(sortTableProjects([icpProject, snsProject])).toEqual([
        icpProject,
        snsProject,
      ]);
    });

    it("should sort SNSes with neurons before SNSes without neuron", () => {
      const snsWithNeurons = {
        ...defaultProject,
        title: "ZZZ",
        neuronCount: 1,
      };
      const snsWithoutNeurons = {
        ...defaultProject,
        title: "AAA",
        neuronCount: 0,
      };
      expect(sortTableProjects([snsWithoutNeurons, snsWithNeurons])).toEqual([
        snsWithNeurons,
        snsWithoutNeurons,
      ]);
      expect(sortTableProjects([snsWithNeurons, snsWithoutNeurons])).toEqual([
        snsWithNeurons,
        snsWithoutNeurons,
      ]);
    });

    it("should sort SNSes with neurons alphabetically", () => {
      const snsA = {
        ...defaultProject,
        title: "AAA",
        neuronCount: 1,
      };
      const snsZ = {
        ...defaultProject,
        title: "ZZZ",
        neuronCount: 1,
      };
      expect(sortTableProjects([snsZ, snsA])).toEqual([snsA, snsZ]);
      expect(sortTableProjects([snsA, snsZ])).toEqual([snsA, snsZ]);
    });

    it("should sort SNSes without neurons alphabetically", () => {
      const snsA = {
        ...defaultProject,
        title: "AAA",
        neuronCount: 0,
      };
      const snsZ = {
        ...defaultProject,
        title: "ZZZ",
        neuronCount: 0,
      };
      expect(sortTableProjects([snsZ, snsA])).toEqual([snsA, snsZ]);
      expect(sortTableProjects([snsA, snsZ])).toEqual([snsA, snsZ]);
    });

    it("should sort case insensitive", () => {
      const snsA = {
        ...defaultProject,
        title: "aaa",
        neuronCount: 0,
      };
      const snsB = {
        ...defaultProject,
        title: "BBB",
        neuronCount: 0,
      };
      const snsC = {
        ...defaultProject,
        title: "ccc",
        neuronCount: 0,
      };
      const snsD = {
        ...defaultProject,
        title: "DDD",
        neuronCount: 0,
      };
      expect(sortTableProjects([snsD, snsC, snsB, snsA])).toEqual([
        snsA,
        snsB,
        snsC,
        snsD,
      ]);
      expect(sortTableProjects([snsC, snsA, snsD, snsB])).toEqual([
        snsA,
        snsB,
        snsC,
        snsD,
      ]);
    });
  });
});
