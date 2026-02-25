import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import type { Universe } from "$lib/types/universe";
import {
  compareByApy,
  compareByNeuron,
  compareByNeuronCount,
  compareByStake,
  compareByStakeInUsd,
  getTableProjects,
  getTotalStakeInUsd,
  sortTableProjects,
} from "$lib/utils/staking.utils";
import {
  FailedTokenAmount,
  UnavailableTokenAmount,
} from "$lib/utils/token.utils";
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

    const snsTokenSymbol = "STS";
    const snsToken = {
      ...mockSnsToken,
      symbol: snsTokenSymbol,
    };

    const snsUniverse: Universe = {
      canisterId: universeId2,
      title: "title2",
      logo: "logo2",
      summary: mockSummary.override({
        token: snsToken,
      }),
    };

    const nnsHref = `/neurons/?u=${OWN_CANISTER_ID_TEXT}`;
    const snsHref = `/neurons/?u=${universeId2}`;

    const defaultExpectedNnsTableProject = {
      rowHref: nnsHref,
      domKey: OWN_CANISTER_ID_TEXT,
      universeId: OWN_CANISTER_ID_TEXT,
      title: "Internet Computer",
      logo: IC_LOGO_ROUNDED,
      neuronCount: 0,
      stake: TokenAmountV2.fromUlps({
        amount: 0n,
        token: ICPToken,
      }),
      stakeInUsd: 0.0,
      tokenSymbol: "ICP",
      availableMaturity: 0n,
      stakedMaturity: 0n,
      isStakeLoading: false,
    };

    const defaultExpectedSnsTableProject = {
      rowHref: snsHref,
      domKey: universeId2,
      universeId: universeId2,
      title: "title2",
      logo: "logo2",
      neuronCount: 0,
      stake: TokenAmountV2.fromUlps({
        amount: 0n,
        token: snsToken,
      }),
      stakeInUsd: 0.0,
      tokenSymbol: snsTokenSymbol,
      availableMaturity: 0n,
      stakedMaturity: 0n,
      isStakeLoading: false,
    };

    const nnsNeuronWithStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 100_000_000n,
        maturityE8sEquivalent: 0n,
        stakedMaturityE8sEquivalent: 0n,
      },
    };

    const nnsNeuronWithoutStake = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: 0n,
        maturityE8sEquivalent: 0n,
        stakedMaturityE8sEquivalent: 0n,
      },
    };

    const snsNeuronWithStake = createMockSnsNeuron({
      stake: 100_000_000n,
      maturity: 0n,
      stakedMaturity: 0n,
      id: [1, 1, 3],
    });

    const snsNeuronWithoutStake = createMockSnsNeuron({
      stake: 0n,
      maturity: 0n,
      stakedMaturity: 0n,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        defaultExpectedNnsTableProject,
        defaultExpectedSnsTableProject,
      ]);
    });

    it("should include universeId for SNS project", () => {
      const snsUniverseId = principal(4455).toText();
      const universes: Universe[] = [
        {
          ...snsUniverse,
          canisterId: snsUniverseId,
        },
      ];

      const tableProjects = getTableProjects({
        universes,
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [snsUniverseId]: { neurons: [] },
        },
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: `/neurons/?u=${snsUniverseId}`,
          domKey: snsUniverseId,
          universeId: snsUniverseId,
        },
      ]);
    });

    it("should include tokenSymbol for SNS project", () => {
      const snsTokenSymbol = "WUV";
      const snsToken = {
        ...mockSnsToken,
        symbol: snsTokenSymbol,
      };
      const universes: Universe[] = [
        {
          ...snsUniverse,
          summary: mockSummary.override({
            token: snsToken,
          }),
        },
      ];

      const tableProjects = getTableProjects({
        universes,
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: { neurons: [] },
        },
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          stake: TokenAmountV2.fromUlps({
            amount: 0n,
            token: snsToken,
          }),
          tokenSymbol: snsTokenSymbol,
        },
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
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
          stakeInUsd: undefined,
        },
      ]);
    });

    it("should include available maturity for NNS neurons", () => {
      const maturity1 = 1_000_000n;
      const maturity2 = 2_000_000n;
      const neuron1 = {
        ...nnsNeuronWithStake,
        fullNeuron: {
          ...nnsNeuronWithStake.fullNeuron,
          cachedNeuronStake: 0n,
          maturityE8sEquivalent: maturity1,
        },
      };
      const neuron2 = {
        ...nnsNeuronWithStake,
        fullNeuron: {
          ...nnsNeuronWithStake.fullNeuron,
          cachedNeuronStake: 0n,
          maturityE8sEquivalent: maturity2,
        },
      };
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        isSignedIn: true,
        nnsNeurons: [neuron1, neuron2],
        snsNeurons: {},
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          rowHref: nnsHref,
          neuronCount: 2,
          availableMaturity: maturity1 + maturity2,
        },
      ]);
    });

    it("should include staked maturity for NNS neurons", () => {
      // There must be some stake because neurons without stake and without
      // available maturity are filtered out.
      const stake = 100_000_000n;
      const maturity1 = 1_500_000n;
      const maturity2 = 2_200_000n;
      const neuron1 = {
        ...nnsNeuronWithStake,
        fullNeuron: {
          ...nnsNeuronWithStake.fullNeuron,
          cachedNeuronStake: stake,
          stakedMaturityE8sEquivalent: maturity1,
        },
      };
      const neuron2 = {
        ...nnsNeuronWithStake,
        fullNeuron: {
          ...nnsNeuronWithStake.fullNeuron,
          cachedNeuronStake: stake,
          stakedMaturityE8sEquivalent: maturity2,
        },
      };
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        isSignedIn: true,
        nnsNeurons: [neuron1, neuron2],
        snsNeurons: {},
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          rowHref: nnsHref,
          neuronCount: 2,
          stake: TokenAmountV2.fromUlps({
            amount: 2n * stake,
            token: ICPToken,
          }),
          stakeInUsd: undefined,
          stakedMaturity: maturity1 + maturity2,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 2,
          stake: TokenAmountV2.fromUlps({
            amount: 2n * snsNeuronWithStake.cached_neuron_stake_e8s,
            token: snsToken,
          }),
          stakeInUsd: undefined,
        },
      ]);
    });

    it("should include available maturity for SNS neurons", () => {
      const maturity1 = 2_000_000n;
      const maturity2 = 3_000_000n;
      const neuron1 = createMockSnsNeuron({
        stake: 0n,
        maturity: maturity1,
        stakedMaturity: 0n,
        id: [1],
      });
      const neuron2 = createMockSnsNeuron({
        stake: 0n,
        maturity: maturity2,
        stakedMaturity: 0n,
        id: [2],
      });
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [neuron1, neuron2],
          },
        },
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 2,
          availableMaturity: maturity1 + maturity2,
        },
      ]);
    });

    it("should include staked maturity for SNS neurons", () => {
      const stake = 100_000_000n;
      const maturity1 = 2_100_000n;
      const maturity2 = 3_400_000n;
      const neuron1 = createMockSnsNeuron({
        stake,
        maturity: 0n,
        stakedMaturity: maturity1,
        id: [1],
      });
      const neuron2 = createMockSnsNeuron({
        stake,
        maturity: 0n,
        stakedMaturity: maturity2,
        id: [2],
      });
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [neuron1, neuron2],
          },
        },
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 2,
          stake: TokenAmountV2.fromUlps({
            amount: 2n * stake,
            token: snsToken,
          }),
          stakeInUsd: undefined,
          stakedMaturity: maturity1 + maturity2,
        },
      ]);
    });

    it("should have stake in USD for NNS neuron", () => {
      const stake = 200_000_000n;
      const icpPrice = 10.0;
      const expectedStakeInUsd = 20.0;

      const nnsNeuron = {
        ...nnsNeuronWithStake,
        fullNeuron: {
          ...nnsNeuronWithStake.fullNeuron,
          cachedNeuronStake: stake,
        },
      };
      const tableProjects = getTableProjects({
        universes: [nnsUniverse],
        isSignedIn: true,
        nnsNeurons: [nnsNeuron],
        snsNeurons: {},
        tickersStore: {
          [LEDGER_CANISTER_ID.toText()]: icpPrice,
        },
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          rowHref: nnsHref,
          neuronCount: 1,
          stake: TokenAmountV2.fromUlps({
            amount: stake,
            token: ICPToken,
          }),
          stakeInUsd: expectedStakeInUsd,
        },
      ]);
    });

    it("should have stake in USD for SNS neuron", () => {
      const stake = 300_000_000n;
      const tokenPrice = 0.1;
      const expectedStakeInUsd = 0.3;

      const snsNeuron = createMockSnsNeuron({
        stake: stake,
        maturity: 0n,
        stakedMaturity: 0n,
        id: [1],
      });
      const tableProjects = getTableProjects({
        universes: [snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: {
            neurons: [snsNeuron],
          },
        },
        tickersStore: {
          [snsUniverse.summary.ledgerCanisterId.toText()]: tokenPrice,
        },
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 1,
          stake: TokenAmountV2.fromUlps({
            amount: stake,
            token: snsToken,
          }),
          stakeInUsd: expectedStakeInUsd,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
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
          stakeInUsd: undefined,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedSnsTableProject,
          rowHref: snsHref,
          neuronCount: 1,
          stake: TokenAmountV2.fromUlps({
            amount: snsNeuronWithStake.cached_neuron_stake_e8s,
            token: snsToken,
          }),
          stakeInUsd: undefined,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          neuronCount: undefined,
          rowHref: nnsHref,
          stake: new UnavailableTokenAmount(ICPToken),
          stakeInUsd: undefined,
          availableMaturity: undefined,
          stakedMaturity: undefined,
        },
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: undefined,
          rowHref: snsHref,
          stake: new UnavailableTokenAmount(snsToken),
          stakeInUsd: undefined,
          availableMaturity: undefined,
          stakedMaturity: undefined,
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
        tickersStore: undefined,
        failedActionableSnses: [],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
          neuronCount: undefined,
          rowHref: nnsHref,
          stake: new UnavailableTokenAmount(ICPToken),
          stakeInUsd: undefined,
          availableMaturity: undefined,
          stakedMaturity: undefined,
          isStakeLoading: true,
        },
        {
          ...defaultExpectedSnsTableProject,
          neuronCount: undefined,
          rowHref: snsHref,
          stake: new UnavailableTokenAmount(snsToken),
          stakeInUsd: undefined,
          availableMaturity: undefined,
          stakedMaturity: undefined,
          isStakeLoading: true,
        },
      ]);
    });

    it("should have FailedToken when failed actionable sns", () => {
      const tableProjects = getTableProjects({
        universes: [nnsUniverse, snsUniverse],
        isSignedIn: true,
        nnsNeurons: [],
        snsNeurons: {
          [universeId2]: undefined,
        },
        tickersStore: undefined,
        failedActionableSnses: [universeId2],
        stakingRewardsResult: undefined,
      });

      expect(tableProjects).toEqual([
        {
          ...defaultExpectedNnsTableProject,
        },
        {
          ...defaultExpectedSnsTableProject,
          rowHref: undefined,
          neuronCount: undefined,
          stake: new FailedTokenAmount(snsToken),
          stakeInUsd: undefined,
          availableMaturity: undefined,
          stakedMaturity: undefined,
          isStakeLoading: false,
        },
      ]);
    });
  });

  describe("compareByNeuronCount", () => {
    it("should compare by number of neurons", () => {
      const project1 = {
        ...mockTableProject,
        neuronCount: 1,
      };
      const project2 = {
        ...mockTableProject,
        neuronCount: 2,
      };

      expect(compareByNeuronCount(project1, project2)).toEqual(1);
    });
  });

  describe("compareByStakeInUsd", () => {
    it("should compare by USD balance", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: 1,
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: 2,
      };

      expect(compareByStakeInUsd(project1, project2)).toEqual(1);
    });
  });

  describe("compareByStake", () => {
    it("should compare by USD stake", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: 1,
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: 2,
      };

      expect(compareByStake(project1, project2)).toEqual(1);
    });

    it("should compare projects with neurons before projects without neurons, if neither has a stake in USD", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: undefined,
        neuronCount: 0,
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: undefined,
        neuronCount: 1,
      };

      expect(compareByStake(project1, project2)).toEqual(1);
    });

    it("should compare ICP before other projects, if neither have neurons", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: undefined,
        neuronCount: 0,
        universeId: principal(2).toText(),
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: undefined,
        neuronCount: 0,
        universeId: OWN_CANISTER_ID_TEXT,
      };

      expect(compareByStake(project1, project2)).toEqual(1);
    });

    it("should push unavailable projects to the bottom", () => {
      const failedProject = {
        ...mockTableProject,
        stake: new FailedTokenAmount(mockSnsToken),
      };
      const nonFailedProject = {
        ...mockTableProject,
        stake: TokenAmountV2.fromUlps({
          amount: 100_000_000n,
          token: ICPToken,
        }),
      };
      expect(sortTableProjects([failedProject, nonFailedProject], [])).toEqual([
        nonFailedProject,
        failedProject,
      ]);
    });
  });

  describe("compareByApy", () => {
    it("should compare by APY", () => {
      const project1 = {
        ...mockTableProject,
        apy: {
          cur: 0.1,
          max: 1,
        },
      };
      const project2 = {
        ...mockTableProject,
        apy: {
          cur: 0.2,
          max: 1,
        },
      };

      expect(compareByApy(project1, project2)).toEqual(1);
      expect(compareByApy(project2, project1)).toEqual(-1);
      expect(compareByApy(project1, project1)).toEqual(0);
    });

    it("should prioritize ICP first", () => {
      const project1 = {
        ...mockTableProject,
        apy: {
          cur: 0.1,
          max: 1,
        },
        universeId: OWN_CANISTER_ID_TEXT,
      };
      const project2 = {
        ...mockTableProject,
        apy: {
          cur: 0.9,
          max: 1,
        },
        universeId: principal(2).toText(),
      };

      expect(compareByApy(project1, project2)).toEqual(-1);
      expect(compareByApy(project2, project1)).toEqual(1);
    });

    it("should push unavailable projects to the bottom", () => {
      const failedProject = {
        ...mockTableProject,
        apy: {
          cur: 0.1,
          max: 1,
        },
        stake: new FailedTokenAmount(mockSnsToken),
      };
      const nonFailedProject = {
        ...mockTableProject,
        apy: {
          cur: 0.1,
          max: 1,
        },
        stake: TokenAmountV2.fromUlps({
          amount: 100_000_000n,
          token: ICPToken,
        }),
      };
      expect(compareByApy(failedProject, nonFailedProject)).toEqual(1);
      expect(compareByApy(nonFailedProject, failedProject)).toEqual(-1);
    });
  });

  describe("compareByNeuron", () => {
    it("should compare by number of neurons", () => {
      const project1 = {
        ...mockTableProject,
        neuronCount: 0,
        universeId: principal(1).toText(),
      };
      const project2 = {
        ...mockTableProject,
        neuronCount: 2,
        universeId: principal(2).toText(),
      };

      expect(compareByNeuron(project1, project2)).toEqual(1);
    });

    it("should prioritize ICP first", () => {
      const project1 = {
        ...mockTableProject,
        neuronCount: 0,
        universeId: OWN_CANISTER_ID_TEXT,
      };
      const project2 = {
        ...mockTableProject,
        neuronCount: 2,
        universeId: principal(2).toText(),
      };

      expect(compareByNeuron(project1, project2)).toEqual(-1);
    });

    it("should push unavailable projects to the bottom", () => {
      const failedProject = {
        ...mockTableProject,
        neuronCount: 10,
        stake: new FailedTokenAmount(mockSnsToken),
      };
      const nonFailedProject = {
        ...mockTableProject,
        neuronCount: 0,
        stake: TokenAmountV2.fromUlps({
          amount: 100_000_000n,
          token: ICPToken,
        }),
      };
      expect(sortTableProjects([failedProject, nonFailedProject], [])).toEqual([
        nonFailedProject,
        failedProject,
      ]);
    });
  });

  describe("compareByProject", () => {
    it("should compare by project name", () => {
      const project1 = {
        ...mockTableProject,
        neuronCount: 0,
        universeId: principal(1).toText(),
        title: "BBB",
      };
      const project2 = {
        ...mockTableProject,
        neuronCount: 2,
        universeId: principal(2).toText(),
        title: "AAA",
      };

      expect(compareByNeuron(project1, project2)).toEqual(1);
    });

    it("should prioritize ICP first", () => {
      const project1 = {
        ...mockTableProject,
        neuronCount: 0,
        universeId: OWN_CANISTER_ID_TEXT,
        title: "Internet Computer",
      };
      const project2 = {
        ...mockTableProject,
        neuronCount: 2,
        universeId: principal(2).toText(),
        title: "AAA",
      };

      expect(compareByNeuron(project1, project2)).toEqual(-1);
    });

    it("should push unavailable projects to the bottom", () => {
      const failedProject = {
        ...mockTableProject,
        title: "ZZZ",
        stake: new FailedTokenAmount(mockSnsToken),
      };
      const nonFailedProject = {
        ...mockTableProject,
        title: "AAA",
        stake: TokenAmountV2.fromUlps({
          amount: 100_000_000n,
          token: ICPToken,
        }),
      };

      expect(sortTableProjects([failedProject, nonFailedProject], [])).toEqual([
        nonFailedProject,
        failedProject,
      ]);
    });
  });

  describe("sortTableProjects", () => {
    const snsUniverseIdA = principal(1).toText();
    const snsUniverseIdB = principal(2).toText();
    const snsUniverseIdC = principal(3).toText();

    const defaultProject = {
      ...mockTableProject,
      neuronCount: 0,
    };

    it("should sort ICP first", () => {
      const icpProject = {
        ...defaultProject,
        universeId: OWN_CANISTER_ID_TEXT,
        domKey: OWN_CANISTER_ID_TEXT,
      };
      const snsProject = {
        ...defaultProject,
        universeId: snsUniverseIdA,
        domKey: snsUniverseIdA,
        stakeInUsd: 999,
      };
      expect(
        sortTableProjects([snsProject, icpProject], [snsUniverseIdA])
      ).toEqual([icpProject, snsProject]);
    });

    it("should push unavailable projects to the bottom", () => {
      const failedProject = {
        ...defaultProject,
        universeId: snsUniverseIdA,
        domKey: snsUniverseIdA,
        stake: new FailedTokenAmount(mockSnsToken),
      };
      const nonFailedProject = {
        ...defaultProject,
        universeId: snsUniverseIdB,
        domKey: snsUniverseIdB,
        stake: TokenAmountV2.fromUlps({
          amount: 100_000_000n,
          token: ICPToken,
        }),
      };
      expect(
        sortTableProjects(
          [failedProject, nonFailedProject],
          [snsUniverseIdA, snsUniverseIdB]
        )
      ).toEqual([nonFailedProject, failedProject]);
    });

    it("should sort by USD stake descending", () => {
      const highStake = {
        ...defaultProject,
        universeId: snsUniverseIdA,
        domKey: snsUniverseIdA,
        stakeInUsd: 100,
      };
      const lowStake = {
        ...defaultProject,
        universeId: snsUniverseIdB,
        domKey: snsUniverseIdB,
        stakeInUsd: 10,
      };
      expect(
        sortTableProjects(
          [lowStake, highStake],
          [snsUniverseIdA, snsUniverseIdB]
        )
      ).toEqual([highStake, lowStake]);
    });

    it("should use universe order as tiebreaker when USD stake is equal", () => {
      const projectA = {
        ...defaultProject,
        universeId: snsUniverseIdA,
        domKey: snsUniverseIdA,
        stakeInUsd: 0,
      };
      const projectB = {
        ...defaultProject,
        universeId: snsUniverseIdB,
        domKey: snsUniverseIdB,
        stakeInUsd: 0,
      };
      const projectC = {
        ...defaultProject,
        universeId: snsUniverseIdC,
        domKey: snsUniverseIdC,
        stakeInUsd: 0,
      };
      // Universe order: C, A, B (simulating launchpad ordering)
      expect(
        sortTableProjects(
          [projectA, projectB, projectC],
          [snsUniverseIdC, snsUniverseIdA, snsUniverseIdB]
        )
      ).toEqual([projectC, projectA, projectB]);
    });
  });

  describe("getTotalStakeInUsd", () => {
    it("should add up USD stakes", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: 2,
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: 3,
      };

      expect(getTotalStakeInUsd([project1, project2])).toBe(5);
    });

    it("should ignore tokens with unknown stake in USD when adding up the total", () => {
      const project1 = {
        ...mockTableProject,
        stakeInUsd: 3,
      };
      const project2 = {
        ...mockTableProject,
        stakeInUsd: undefined,
      };
      const project3 = {
        ...mockTableProject,
        stakeInUsd: 5,
      };

      expect(getTotalStakeInUsd([project1, project2, project3])).toBe(8);
    });
  });
});
