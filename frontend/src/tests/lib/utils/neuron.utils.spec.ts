import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_HOUR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import {
  MAX_NEURONS_MERGED,
  MIN_NEURON_STAKE,
  TOPICS_TO_FOLLOW_NNS,
} from "$lib/constants/neurons.constants";
import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
import type { IcpAccountsStoreData } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  ageMultiplier,
  allHaveSameFollowees,
  ballotsWithDefinedProposal,
  bonusMultiplier,
  canBeMerged,
  canUserManageNeuronFundParticipation,
  checkInvalidState,
  dissolveDelayMultiplier,
  filterIneligibleNnsNeurons,
  followeesByTopic,
  followeesNeurons,
  formatVotingPower,
  formattedMaturity,
  formattedStakedMaturity,
  formattedTotalMaturity,
  getDissolvingTimeInSeconds,
  getDissolvingTimestampSeconds,
  getNeuronById,
  getNeuronTags,
  getSpawningTimeInSeconds,
  hasEnoughMaturityToStake,
  hasJoinedCommunityFund,
  hasValidStake,
  isEnoughMaturityToSpawn,
  isEnoughToStakeNeuron,
  isHotKeyControllable,
  isIdentityController,
  isNeuronControllable,
  isNeuronControllableByUser,
  isNeuronControlledByHardwareWallet,
  isSpawning,
  isValidInputAmount,
  mapMergeableNeurons,
  mapNeuronIds,
  maturityLastDistribution,
  minNeuronSplittable,
  neuronAge,
  neuronCanBeSplit,
  neuronStake,
  neuronVotingPower,
  neuronsVotingPower,
  sortNeuronsByCreatedTimestamp,
  topicsToFollow,
  userAuthorizedNeuron,
  validTopUpAmount,
  votedNeuronDetails,
  type CompactNeuronInfo,
  type IneligibleNeuronData,
  type InvalidState,
  type NeuronTagData,
} from "$lib/utils/neuron.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  mockFullNeuron,
  mockNeuron,
  mockNeuronControlled,
  mockNeuronNotControlled,
} from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { WizardStep } from "@dfinity/gix-components";
import {
  NeuronState,
  NeuronType,
  Topic,
  Vote,
  type BallotInfo,
  type NeuronInfo,
  type ProposalInfo,
  type RewardEvent,
} from "@dfinity/nns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("neuron-utils", () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(Date.now());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("votingPower", () => {
    const tokenStake = TokenAmount.fromString({
      amount: "2.2",
      token: ICPToken,
    }) as TokenAmount;
    const neuron = {
      ...mockNeuron,
      ageSeconds: 0n,
      dissolveDelaySeconds: 0n,
      fullNeuron: {
        ...mockFullNeuron,
        cachedNeuronStake: tokenStake.toE8s(),
      },
    };
    it("should return zero for delays less than six months", () => {
      expect(
        neuronVotingPower({
          neuron: mockNeuron,
          newDissolveDelayInSeconds: 100n,
        })
      ).toBe(0n);
    });

    it("should return more than stake when delay more than six months", () => {
      expect(
        neuronVotingPower({
          neuron,
          newDissolveDelayInSeconds: BigInt(
            SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR
          ),
        })
      ).toBeGreaterThan(tokenStake.toE8s());
    });

    it("should return the double when delay is eight years", () => {
      const agedNeuron = {
        ...neuron,
        dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      };
      expect(
        neuronVotingPower({
          neuron: agedNeuron,
        })
      ).toBe(tokenStake.toE8s() * 2n);
    });

    it("should take into account age bonus", () => {
      const agedNeuron = {
        ...neuron,
        ageSeconds: BigInt(SECONDS_IN_YEAR),
        dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };

      const notSoAgedNeuron = {
        ...neuron,
        ageSeconds: 2n,
        dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };
      const powerWithAge = neuronVotingPower({
        neuron: agedNeuron,
      });
      const powerWithoutAge = neuronVotingPower({
        neuron: notSoAgedNeuron,
      });
      expect(powerWithAge).toBeGreaterThan(powerWithoutAge);
    });

    it("should use the dissolve", () => {
      const agedNeuron = {
        ...neuron,
        ageSeconds: BigInt(SECONDS_IN_YEAR),
        dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };
      const powerWithNewDissolve = neuronVotingPower({
        neuron: agedNeuron,
        newDissolveDelayInSeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      });
      const powerWithoutAge = neuronVotingPower({
        neuron: agedNeuron,
      });
      expect(powerWithNewDissolve).toBeGreaterThan(powerWithoutAge);
    });

    it("should match the calculation", () => {
      const neuron = {
        ...mockNeuron,
        ageSeconds: BigInt(SECONDS_IN_YEAR),
        dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR * 1.5),
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: 200_000_000n,
        },
      };
      const power = neuronVotingPower({
        neuron,
      });
      expect(power).toEqual(252_343_750n);
    });
  });

  describe("formatVotingPower", () => {
    it("should format", () => {
      expect(formatVotingPower(0n)).toBe("0.00");
      expect(formatVotingPower(100_000_000n)).toBe("1.00");
      expect(formatVotingPower(9_999_900_000n)).toBe("100.00");
    });
  });

  describe("dissolveDelayMultiplier", () => {
    it("be 1 when dissolve is 0", () => {
      expect(dissolveDelayMultiplier(0n)).toBe(1);
    });

    it("be 2 when dissolve is eight years", () => {
      expect(dissolveDelayMultiplier(BigInt(SECONDS_IN_EIGHT_YEARS))).toBe(2);
    });

    it("is a maximum of 2", () => {
      expect(dissolveDelayMultiplier(BigInt(SECONDS_IN_EIGHT_YEARS * 2))).toBe(
        2
      );
      expect(dissolveDelayMultiplier(BigInt(SECONDS_IN_EIGHT_YEARS * 4))).toBe(
        2
      );
    });

    it("returns more than 1 with positive delay", () => {
      expect(
        dissolveDelayMultiplier(BigInt(SECONDS_IN_HALF_YEAR))
      ).toBeGreaterThan(1);
      expect(dissolveDelayMultiplier(1_000n)).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(dissolveDelayMultiplier(BigInt(SECONDS_IN_YEAR))).toBe(1.125);
    });
  });

  describe("ageMultiplier", () => {
    it("be 1 when age is 0", () => {
      expect(ageMultiplier(0n)).toBe(1);
    });

    it("be 1.25 when age is four years", () => {
      expect(ageMultiplier(BigInt(SECONDS_IN_FOUR_YEARS))).toBe(1.25);
    });

    it("is a maximum of 1.25", () => {
      expect(ageMultiplier(BigInt(SECONDS_IN_EIGHT_YEARS * 2))).toBe(1.25);
      expect(ageMultiplier(BigInt(SECONDS_IN_EIGHT_YEARS * 4))).toBe(1.25);
    });

    it("returns more than 1 with positive age", () => {
      expect(ageMultiplier(BigInt(SECONDS_IN_HALF_YEAR))).toBeGreaterThan(1);
      expect(ageMultiplier(1_000n)).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(ageMultiplier(BigInt(SECONDS_IN_YEAR))).toBe(1.0625);
    });
  });

  describe("bonusMultiplier", () => {
    it("should return the multiplier", () => {
      expect(
        bonusMultiplier({
          amount: 300n,
          multiplier: 0.25,
          max: 600,
        })
      ).toBe(1.125);

      expect(
        bonusMultiplier({
          amount: 600n,
          multiplier: 0.5,
          max: 600,
        })
      ).toBe(1.5);

      expect(
        bonusMultiplier({
          amount: 400n,
          multiplier: 1,
          max: 200,
        })
      ).toBe(2);

      expect(
        bonusMultiplier({
          amount: 400n,
          multiplier: 0.25,
          max: 0,
        })
      ).toBe(1);
    });
  });

  describe("hasValidStake", () => {
    it("returns whether the stake is valid or not", () => {
      const fullNeuronWithEnoughStake = {
        ...mockFullNeuron,
        cachedNeuronStake: 3_000_000_000n,
      };
      const neuronWithEnoughStake = {
        ...mockNeuron,
        fullNeuron: fullNeuronWithEnoughStake,
      };
      expect(hasValidStake(neuronWithEnoughStake)).toBeTruthy();

      const fullNeuronWithEnoughStakeInMaturity = {
        ...mockFullNeuron,
        cachedNeuronStake: 100_000_000n,
        maturityE8sEquivalent: 3_000_000_000n,
      };
      const neuronWithEnoughStakeInMaturity = {
        ...mockNeuron,
        fullNeuron: fullNeuronWithEnoughStakeInMaturity,
      };
      expect(hasValidStake(neuronWithEnoughStakeInMaturity)).toBeTruthy();

      const fullNeuronWithoutEnoughStake = {
        ...mockFullNeuron,
        cachedNeuronStake: BigInt(DEFAULT_TRANSACTION_FEE_E8S / 4),
        maturityE8sEquivalent: BigInt(DEFAULT_TRANSACTION_FEE_E8S / 4),
      };
      const neuronWithoutEnoughStake = {
        ...mockNeuron,
        fullNeuron: fullNeuronWithoutEnoughStake,
      };
      expect(hasValidStake(neuronWithoutEnoughStake)).toBe(false);

      const neuronWithoutFullNeuron = {
        ...mockNeuron,
      };
      neuronWithoutFullNeuron.fullNeuron = undefined;
      expect(hasValidStake(neuronWithoutFullNeuron)).toBe(false);
    });
  });

  describe("hasJoinedCommunityFund", () => {
    it("returns true when neuron has joined community", () => {
      const joinedNeuron = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: 100n,
      };
      expect(hasJoinedCommunityFund(joinedNeuron)).toBe(true);
    });

    it("returns true when neuron has not joined community", () => {
      const joinedNeuron = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: undefined,
      };
      expect(hasJoinedCommunityFund(joinedNeuron)).toBe(false);
    });
  });

  describe("getDissolvingTimestampSeconds", () => {
    it("returns undefined if neuron not dissolving", () => {
      const dissolveNeuron = {
        ...mockNeuron,
        state: NeuronState.Dissolved,
      };
      expect(getDissolvingTimestampSeconds(dissolveNeuron)).toBeUndefined();
      const lockedNeuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
      };
      expect(getDissolvingTimestampSeconds(lockedNeuron)).toBeUndefined();
    });

    it("returns undefined if dissolve state has no timestamp", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolving,
        fullNeuron: {
          ...mockFullNeuron,
          dissolveState: undefined,
        },
      };
      expect(getDissolvingTimestampSeconds(neuron)).toBeUndefined();
    });

    it("returns dissolve date", () => {
      const dissolveDate = BigInt(nowInSeconds() + SECONDS_IN_FOUR_YEARS);
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolving,
        fullNeuron: {
          ...mockFullNeuron,
          dissolveState: {
            WhenDissolvedTimestampSeconds: dissolveDate,
          },
        },
      };
      expect(getDissolvingTimestampSeconds(neuron)).toBe(dissolveDate);
    });
  });

  describe("getDissolvingTimeInSeconds", () => {
    it("returns undefined if neuron not dissolving", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolved,
      };
      expect(getDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns undefined if dissolve state has no timestamp", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolving,
        fullNeuron: {
          ...mockFullNeuron,
          dissolveState: undefined,
        },
      };
      expect(getDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns duration from today until dissolving time", () => {
      const todayInSeconds = BigInt(nowInSeconds());
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolving,
        fullNeuron: {
          ...mockFullNeuron,
          dissolveState: {
            WhenDissolvedTimestampSeconds: delayInSeconds,
          },
        },
      };
      expect(getDissolvingTimeInSeconds(neuron)).toBe(BigInt(SECONDS_IN_YEAR));
    });
  });

  describe("getSpawningTimeInSeconds", () => {
    it("returns undefined if neuron not spawning", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
      };
      expect(getSpawningTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns undefined if spawnAtTimesSeconds is undefined", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: undefined,
        },
      };
      expect(getSpawningTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns duration from today until spawning time", () => {
      const todayInSeconds = BigInt(Math.round(Date.now() / 1000));
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: delayInSeconds,
        },
      };
      expect(getSpawningTimeInSeconds(neuron)).toBe(BigInt(SECONDS_IN_YEAR));
    });
  });

  describe("formattedMaturity", () => {
    it("returns 0 when no full neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(formattedMaturity(neuron)).toBe("0");
    });

    it("returns maturity of stake with two decimals", () => {
      const stake = TokenAmount.fromString({
        amount: "2",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          maturityE8sEquivalent: stake.toE8s() / 2n,
        },
      };
      expect(formattedMaturity(neuron)).toBe("1.00");
    });

    it("returns 0 when maturity is 0", () => {
      const stake = TokenAmount.fromString({
        amount: "3",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          maturityE8sEquivalent: 0n,
        },
      };
      expect(formattedMaturity(neuron)).toBe("0");
    });
  });

  describe("formattedTotalMaturity", () => {
    it("returns 0 when no full neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(formattedTotalMaturity(neuron)).toBe("0");
    });

    it("returns total maturity with two decimals", () => {
      const stake = TokenAmount.fromString({
        amount: "2",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: stake.toE8s(),
          stakedMaturityE8sEquivalent: stake.toE8s() / 2n,
        },
      };
      expect(formattedTotalMaturity(neuron)).toBe("3.00");
    });

    it("returns maturity when staked maturity is 0", () => {
      const stake = TokenAmount.fromString({
        amount: "2",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: stake.toE8s(),
          stakedMaturityE8sEquivalent: 0n,
        },
      };

      expect(formattedTotalMaturity(neuron)).toBe("2.00");
    });

    it("returns staked maturity when staked is 0", () => {
      const stake = TokenAmount.fromString({
        amount: "1",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: 0n,
          stakedMaturityE8sEquivalent: stake.toE8s(),
        },
      };
      expect(formattedTotalMaturity(neuron)).toBe("1.00");
    });
  });

  describe("formattedStakedMaturity", () => {
    it("returns 0 when no full neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(formattedStakedMaturity(neuron)).toBe("0");
    });

    it("returns staked maturity with two decimals", () => {
      const stake = TokenAmount.fromString({
        amount: "2",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          stakedMaturityE8sEquivalent: stake.toE8s() / 2n,
        },
      };
      expect(formattedStakedMaturity(neuron)).toBe("1.00");
    });

    it("returns 0 when staked maturity is 0", () => {
      const stake = TokenAmount.fromString({
        amount: "3",
        token: ICPToken,
      }) as TokenAmount;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          stakedMaturityE8sEquivalent: 0n,
        },
      };
      expect(formattedStakedMaturity(neuron)).toBe("0");
    });
  });

  describe("sortNeuronsByCreatedTimestamp", () => {
    it("should sort neurons by createdTimestampSeconds", () => {
      const neuron1 = { ...mockNeuron, createdTimestampSeconds: 1n };
      const neuron2 = { ...mockNeuron, createdTimestampSeconds: 2n };
      const neuron3 = { ...mockNeuron, createdTimestampSeconds: 3n };
      expect(sortNeuronsByCreatedTimestamp([])).toEqual([]);
      expect(sortNeuronsByCreatedTimestamp([neuron1])).toEqual([neuron1]);
      expect(
        sortNeuronsByCreatedTimestamp([neuron3, neuron2, neuron1])
      ).toEqual([neuron3, neuron2, neuron1]);
      expect(
        sortNeuronsByCreatedTimestamp([neuron2, neuron1, neuron3])
      ).toEqual([neuron3, neuron2, neuron1]);
    });
  });

  describe("isNeuronControllable", () => {
    it("should return true if neuron controller is the current main account", () => {
      const accounts = {
        main: mockMainAccount,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockMainAccount.principal?.toText(),
        },
      };

      expect(
        isNeuronControllable({ neuron, identity: mockIdentity, accounts })
      ).toBe(true);
    });

    it("should return true if neuron controller is the current identity principal", () => {
      const accounts = {
        main: undefined,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };

      expect(
        isNeuronControllable({ neuron, identity: mockIdentity, accounts })
      ).toBe(true);
    });

    it("should return false if fullNeuron not defined", () => {
      const accounts = {
        main: undefined,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };

      expect(
        isNeuronControllable({ neuron, identity: mockIdentity, accounts })
      ).toBe(false);
    });

    it("should return true if neuron controller is a hardware wallet", () => {
      const accounts = {
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
        },
      };

      expect(
        isNeuronControllable({ neuron, identity: mockIdentity, accounts })
      ).toBe(true);
    });

    it("should return false if no accounts and no in the identity", () => {
      const accounts = {
        main: undefined,
        subaccounts: undefined,
      };
      expect(
        isNeuronControllable({
          neuron: mockNeuron,
          identity: mockIdentity,
          accounts,
        })
      ).toBe(false);
    });
  });

  describe("isNeuronControllableByUser", () => {
    it("should return true if neuron controller is the current identity principal", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockMainAccount.principal?.toText(),
        },
      };

      expect(
        isNeuronControllableByUser({ neuron, mainAccount: mockMainAccount })
      ).toBe(true);
    });

    it("should return false if fullNeuron not defined", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };

      expect(
        isNeuronControllableByUser({ neuron, mainAccount: mockMainAccount })
      ).toBe(false);
    });

    it("should return false if neuron controller is a hardware wallet", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
        },
      };

      expect(
        isNeuronControllableByUser({ neuron, mainAccount: mockMainAccount })
      ).toBe(false);
    });
  });

  describe("isNeuronControlledByHardwareWallet", () => {
    it("should return false if neuron controller is the current main account", () => {
      const accounts = {
        main: mockMainAccount,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockMainAccount.principal?.toText(),
        },
      };

      expect(isNeuronControlledByHardwareWallet({ neuron, accounts })).toBe(
        false
      );
    });

    it("should return false if fullNeuron not defined", () => {
      const accounts = {
        main: undefined,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };

      expect(isNeuronControlledByHardwareWallet({ neuron, accounts })).toBe(
        false
      );
    });

    it("should return true if neuron controller is hardware wallet", () => {
      const accounts = {
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
        },
      };

      expect(isNeuronControlledByHardwareWallet({ neuron, accounts })).toBe(
        true
      );
    });
  });

  describe("neuronStake", () => {
    it("should calculate neuron stake", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: 100n,
          neuronFees: 10n,
        },
      };
      expect(neuronStake(neuron)).toBe(90n);
    });

    it("should return 0n when stake is not available", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(neuronStake(neuron)).toBe(0n);
    });
  });

  describe("ballotsWithDefinedProposal", () => {
    const ballot: BallotInfo = {
      vote: Vote.Yes,
      proposalId: undefined,
    };
    const ballotWithProposalId: BallotInfo = {
      vote: Vote.Yes,
      proposalId: 0n,
    };

    it("should filter out ballots w/o proposalIds", () => {
      expect(
        ballotsWithDefinedProposal({
          ...mockNeuron,
          recentBallots: [ballot, ballot],
        })
      ).toEqual([]);
      expect(
        ballotsWithDefinedProposal({
          ...mockNeuron,
          recentBallots: [ballot, ballotWithProposalId],
        })
      ).toEqual([ballotWithProposalId]);
      expect(
        ballotsWithDefinedProposal({
          ...mockNeuron,
          recentBallots: [ballotWithProposalId, ballotWithProposalId],
        })
      ).toEqual([ballotWithProposalId, ballotWithProposalId]);
    });
  });

  describe("isValidInputAmount", () => {
    it("return false if amount is undefined", () => {
      expect(isValidInputAmount({ amount: undefined, max: 10 })).toBe(false);
    });

    it("return true if amount is lower than max", () => {
      expect(isValidInputAmount({ amount: 3, max: 10 })).toBe(true);
    });

    it("return false if amount is higher than max", () => {
      expect(isValidInputAmount({ amount: 40, max: 10 })).toBe(false);
    });
  });

  describe("followeesNeurons", () => {
    it("should transform followees", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          followees: [
            {
              topic: Topic.ExchangeRate,
              followees: [0n, 1n],
            },
            {
              topic: Topic.Kyc,
              followees: [1n],
            },
            {
              topic: Topic.Governance,
              followees: [0n, 1n, 2n],
            },
          ],
        },
      };

      expect(followeesNeurons(neuron)).toStrictEqual([
        {
          neuronId: 0n,
          topics: [Topic.ExchangeRate, Topic.Governance],
        },
        {
          neuronId: 1n,
          topics: [Topic.ExchangeRate, Topic.Kyc, Topic.Governance],
        },
        {
          neuronId: 2n,
          topics: [Topic.Governance],
        },
      ]);
    });

    it("should return empty array if no followees", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          followees: [],
        },
      };
      expect(followeesNeurons(neuron)).toStrictEqual([]);
    });

    it("should return empty array if no fullNeuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(followeesNeurons(neuron)).toStrictEqual([]);
    });
  });

  describe("isEnoughMaturityToSpawn", () => {
    it("return false if just enough ICP to create a neuron without taking into account variance", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE + 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(false);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE * 2n + 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron: neuron2, percentage: 50 })).toBe(
        false
      );
    });
    it("return true if enough ICP to spawn a neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE * 3n + 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(true);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE * 5n + 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron: neuron2, percentage: 50 })).toBe(
        true
      );
    });
    it("returns false if not enough ICP to spawn a neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE - 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(false);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: MIN_NEURON_STAKE * 2n + 1_000n,
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron: neuron2, percentage: 10 })).toBe(
        false
      );
    });
  });

  describe("isEnoughToStakeNeuron", () => {
    it("return true if enough ICP to create a neuron", () => {
      expect(isEnoughToStakeNeuron({ stakeE8s: 300_000_000n })).toBe(true);
    });
    it("returns false if not enough ICP to create a neuron", () => {
      expect(isEnoughToStakeNeuron({ stakeE8s: 10_000n })).toBe(false);
    });

    it("takes into account fee", () => {
      expect(
        isEnoughToStakeNeuron({
          stakeE8s: 100_000_000n,
          feeE8s: 10_000n,
        })
      ).toBe(false);
      expect(
        isEnoughToStakeNeuron({
          stakeE8s: 100_000_000n,
        })
      ).toBe(true);
    });
  });

  describe("mapNeuronIds", () => {
    it("should map neuron id to neuron info", () => {
      const mappedNeurons = mapNeuronIds({
        neuronIds: [mockNeuron.neuronId],
        neurons: [mockNeuron],
      });
      expect(mappedNeurons[0]).toBe(mockNeuron);
    });
  });

  describe("checkInvalidState", () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    const stepName = "ok";
    const spyOnInvalid = vi.fn();
    const invalidStates: InvalidState<boolean>[] = [
      {
        stepName,
        isInvalid: (arg: boolean) => arg,
        onInvalid: spyOnInvalid,
      },
    ];
    const currentStep: WizardStep = {
      name: stepName,
      title: "some title",
    };
    it("does nothing if state is valid", () => {
      checkInvalidState({
        invalidStates,
        currentStep,
        // We use the args to trigger an invalid state or not
        args: false,
      });
      expect(spyOnInvalid).not.toHaveBeenCalled();
    });

    it("calls onInvalid if state is invalid", () => {
      checkInvalidState({
        invalidStates,
        currentStep,
        // We use the args to trigger an invalid state or not
        args: true,
      });
      expect(spyOnInvalid).toHaveBeenCalled();
    });
  });

  describe("isHotKeyControllable", () => {
    it("returns true if neuron is controllable by hotkey", () =>
      expect(
        isHotKeyControllable({
          neuron: mockNeuronControlled,
          identity: mockIdentity,
        })
      ).toBe(true));

    it("returns false if neuron is not controllable by hotkey", () =>
      expect(
        isHotKeyControllable({
          neuron: mockNeuronNotControlled,
          identity: mockIdentity,
        })
      ).toBe(false));

    it("returns false if identity is in hotkeys and is the controller", () =>
      expect(
        isHotKeyControllable({
          neuron: {
            ...mockNeuron,
            fullNeuron: {
              ...mockFullNeuron,
              hotKeys: [mockIdentity.getPrincipal().toText()],
              controller: mockIdentity.getPrincipal().toText(),
            },
          },
          identity: mockIdentity,
        })
      ).toBe(false));
  });

  describe("getNeuronHotkeys", () => {
    const accountsWithHW = {
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    };

    const accountsWithoutHw = {
      main: mockMainAccount,
      hardwareWallets: [],
    };

    const hotkeyTag = { text: "Hotkey control" } as NeuronTagData;
    const hwTag = { text: "Hardware Wallet Controlled" } as NeuronTagData;
    const nfTag = { text: "Neurons' fund" } as NeuronTagData;
    const seedTag = {
      text: "Seed",
    } as NeuronTagData;
    const ectTag = {
      text: "Early Contributor Token",
    } as NeuronTagData;
    it("returns 'hotkey' if neuron is controllable by hotkey and hardware wallet is not the controller", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "not-hardware-wallet",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([hotkeyTag]);
    });

    it("returns 'hotkey' if neuron is controllable by hotkey and no hardware wallet is attached", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithoutHw,
          i18n: en,
        })
      ).toEqual([hotkeyTag]);
    });

    it("returns 'Hardware Wallet Controlled' if neuron is controllable by hotkey and hardware wallet is the controller", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([hwTag]);
    });

    it("returns empty array if neuron is the controller and a hotkey", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([]);
    });

    it("returns empty array if no identity", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "not-user",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: null,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([]);
    });

    it("returns 'Neurons' Fund' if neuron is part of Neurons' Fund", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: 123_445n,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([nfTag]);
    });

    it("returns 'Neurons' Fund' and 'Hotkey Control'", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: 123_445n,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          hotKeys: [mockIdentity.getPrincipal().toText()],
          controller: "not-user-nor-hw",
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([nfTag, hotkeyTag]);
    });

    it("returns 'Neurons' Fund' and 'Hardware Wallet Controlled'", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: 123_445n,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          hotKeys: [mockIdentity.getPrincipal().toText()],
          controller: mockHardwareWalletAccount.principal?.toText(),
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([nfTag, hwTag]);
    });

    it("returns 'Seed'", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        neuronType: NeuronType.Seed,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          neuronType: NeuronType.Seed,
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([seedTag]);
    });

    it("returns 'Ect'", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        neuronType: NeuronType.Ect,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          neuronType: NeuronType.Ect,
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([ectTag]);
    });

    it("returns 'Seed' and 'Neurons' Fund' and 'Hardware Wallet Controlled'", () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        neuronType: NeuronType.Seed,
        joinedCommunityFundTimestampSeconds: 123_445n,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          neuronType: NeuronType.Seed,
          hotKeys: [mockIdentity.getPrincipal().toText()],
          controller: mockHardwareWalletAccount.principal?.toText(),
        },
      };
      expect(
        getNeuronTags({
          neuron: neuron,
          identity: mockIdentity,
          accounts: accountsWithHW,
          i18n: en,
        })
      ).toEqual([seedTag, nfTag, hwTag]);
    });
  });

  describe("isIdentityController", () => {
    it("return true if identity is the controller of the neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      expect(isIdentityController({ neuron, identity: mockIdentity })).toBe(
        true
      );
    });

    it("return false if identity is not the controller of the neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-controlled",
        },
      };
      expect(isIdentityController({ neuron, identity: mockIdentity })).toBe(
        false
      );
    });

    it("return true if identity not defined", () => {
      expect(isIdentityController({ neuron: mockNeuron })).toBe(false);
    });

    it("return true if identity is null", () => {
      expect(isIdentityController({ neuron: mockNeuron, identity: null })).toBe(
        false
      );
    });
  });

  describe("allHaveSameFollowees", () => {
    it("returns true if same followees", () => {
      const followees = [4n, 6n, 9n];
      expect(allHaveSameFollowees([followees, [...followees]])).toBe(true);
    });

    it("returns true if no followees", () => {
      expect(allHaveSameFollowees([[], [], []])).toBe(true);
    });

    it("returns false if not same followees", () => {
      const followees1 = [4n, 6n, 9n];
      const followees2 = [1n, 6n, 9n];
      expect(allHaveSameFollowees([followees1, followees2])).toBe(false);
    });

    it("returns false if not the same amount", () => {
      const followees = [4n, 6n, 9n];
      expect(allHaveSameFollowees([followees, followees.slice(1)])).toBe(false);
    });
  });

  describe("isSpawning", () => {
    it("returns true if neuron is spawning", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: 123_123_113n,
        },
      };
      expect(isSpawning(neuron)).toBe(true);
    });

    it("returns false if neuron is not spawning", () => {
      const neuron = {
        ...mockNeuron,
        status: NeuronState.Locked,
        fullNeuron: {
          ...mockFullNeuron,
          spawnAtTimesSeconds: undefined,
        },
      };
      expect(isSpawning(neuron)).toBe(false);
    });
  });

  describe("mapMergeableNeurons", () => {
    const mainAccountController = mockMainAccount.principal?.toText() as string;
    it("wraps mergeable neurons with true if mergeable", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuron2 = {
        ...neuron,
        neuronId: 444n,
      };
      const neuron3 = {
        ...neuron,
        neuronId: 445n,
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron, neuron2, neuron3],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [],
      });
      expect(wrappedNeurons[0].mergeable).toBe(true);
      expect(wrappedNeurons[1].mergeable).toBe(true);
      expect(wrappedNeurons[2].mergeable).toBe(true);
    });

    it("wraps mergeable neurons with false if user is not controller or joined community fund", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: "not-user",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        joinedCommunityFundTimestampSeconds: 1_234n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-user",
          hotKeys: [],
        },
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron, neuron2],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
      expect(wrappedNeurons[1].mergeable).toBe(false);
    });

    it("wraps mergeable neurons with false if neuron is spawning", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
    });

    it("wraps mergeable neurons with false if neuron is Dissolving", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolving,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
    });

    it("wraps mergeable neurons with false if neuron is Dissolved", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Dissolved,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
    });

    it("checks current selection ManageNeuron followees to define a neuron as mergeable", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuronFollowingManageNeuron = {
        ...neuron,
        neuronId: 444n,
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [444n] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: 445n,
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron, neuronFollowingManageNeuron, neuron3],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [neuronFollowingManageNeuron],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
      expect(wrappedNeurons[1].mergeable).toBe(true);
      expect(wrappedNeurons[2].mergeable).toBe(false);
    });

    it("checks current selection controller to define a neuron as mergeable", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mockHardwareWalletAccount.principal?.toText() as string,
          hotKeys: [],
        },
      };
      const notSameControllerNeuron = {
        ...neuron,
        neuronId: 444n,
        fullNeuron: {
          ...neuron.fullNeuron,
          controller: mainAccountController,
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: 445n,
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron, notSameControllerNeuron, neuron3],
        accounts: {
          main: mockMainAccount,
          hardwareWallets: [mockHardwareWalletAccount],
        },
        selectedNeurons: [notSameControllerNeuron],
      });
      expect(wrappedNeurons[0].mergeable).toBe(false);
      expect(wrappedNeurons[1].mergeable).toBe(true);
      expect(wrappedNeurons[2].mergeable).toBe(false);
    });

    it("wraps selected neurons with selected property true", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuronFollowingManageNeuron = {
        ...neuron,
        neuronId: 444n,
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [444n] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: 445n,
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [neuron, neuronFollowingManageNeuron, neuron3],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [neuron],
      });
      expect(wrappedNeurons[0].selected).toBe(true);
      expect(wrappedNeurons[1].mergeable).toBe(false);
      expect(wrappedNeurons[2].selected).toBe(false);
    });

    it(`does not allow to have more mergeable once ${MAX_NEURONS_MERGED} is reached`, () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.Locked,
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuronFollowingManageNeuron = {
        ...neuron,
        neuronId: 444n,
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [444n] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: 445n,
      };
      const neuron4 = {
        ...neuron,
        neuronId: 455n,
      };
      const neuron5 = {
        ...neuron,
        neuronId: 465n,
      };
      const wrappedNeurons = mapMergeableNeurons({
        neurons: [
          neuron,
          neuronFollowingManageNeuron,
          neuron3,
          neuron4,
          neuron5,
        ],
        accounts: {
          main: mockMainAccount,
        },
        selectedNeurons: [neuron, neuron3],
      });
      expect(wrappedNeurons[0].selected).toBe(true);
      expect(wrappedNeurons[1].mergeable).toBe(false);
      expect(wrappedNeurons[2].selected).toBe(true);
      expect(wrappedNeurons[3].mergeable).toBe(false);
      expect(wrappedNeurons[4].mergeable).toBe(false);
    });
  });

  describe("canBeMerged", () => {
    it("return valid if two neurons can be merged", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "same",
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "same",
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(true);
    });

    it("return invalid if two neurons have same id", () => {
      const neuron = {
        ...mockNeuron,
      };
      const neuron2 = {
        ...mockNeuron,
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return invalid if two neurons do not have same controller", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller-1",
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller-2",
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return invalid if two neurons do not have same followees on Manage Neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [10n, 40n],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [10n],
            },
          ],
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return valid if two neurons have same followees on Manage Neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [40n, 10n],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [10n, 40n],
            },
          ],
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(true);
    });

    it("return invalid if one neurons have same followees on Manage Neuron and the other none", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [40n, 10n],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [],
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return invalid if neurons have different followees on Manage Neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [40n, 10n],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [40n, 200n],
            },
          ],
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return invalid if two neurons have different neuron types", () => {
      const neuron = {
        ...mockNeuron,
        neuronType: NeuronType.Seed,
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        neuronType: undefined,
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });

    it("return valid if two neurons have same neuron type", () => {
      const neuron = {
        ...mockNeuron,
        neuronType: NeuronType.Ect,
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        neuronType: NeuronType.Ect,
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(true);
    });

    it("return valid if two neurons are default type", () => {
      const neuron = {
        ...mockNeuron,
        neuronType: undefined,
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 444n,
        neuronType: undefined,
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(true);
    });
  });

  describe("followeesByTopic", () => {
    const followees = [
      {
        topic: Topic.ExchangeRate,
        followees: [0n, 1n],
      },
      {
        topic: Topic.Kyc,
        followees: [1n],
      },
      {
        topic: Topic.Governance,
        followees: [0n, 1n, 2n],
      },
    ];
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        followees,
      },
    };

    it("should return followees by topic", () => {
      expect(followeesByTopic({ neuron, topic: followees[0].topic })).toEqual(
        followees[0].followees
      );
      expect(followeesByTopic({ neuron, topic: followees[1].topic })).toEqual(
        followees[1].followees
      );
      expect(followeesByTopic({ neuron, topic: followees[2].topic })).toEqual(
        followees[2].followees
      );
    });

    it("should return undefined if topic not found", () => {
      expect(
        followeesByTopic({ neuron, topic: Topic.ManageNeuron })
      ).toBeUndefined();
    });

    it("should return undefined if no neuron", () => {
      expect(
        followeesByTopic({ neuron: undefined, topic: Topic.ManageNeuron })
      ).toBeUndefined();
    });

    it("should return undefined if no fullNeuron", () => {
      expect(
        followeesByTopic({
          neuron: { ...mockNeuron, fullNeuron: undefined },
          topic: Topic.ManageNeuron,
        })
      ).toBeUndefined();
    });
  });

  describe("topicsToFollow", () => {
    const neuronWithoutManageNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        followees: [
          {
            topic: Topic.ExchangeRate,
            followees: [0n, 1n],
          },
        ],
      },
    };
    const neuronWithoutFollowees = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        followees: [],
      },
    };
    const neuronWithManageNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        followees: [
          {
            topic: Topic.ManageNeuron,
            followees: [0n, 1n],
          },
        ],
      },
    };

    it("should not return deprecated topics", () => {
      expect(topicsToFollow(neuronWithoutManageNeuron)).toEqual(
        TOPICS_TO_FOLLOW_NNS.filter(
          (topic) =>
            topic !== Topic.ManageNeuron && !DEPRECATED_TOPICS.includes(topic)
        )
      );
      expect(topicsToFollow(neuronWithoutFollowees)).toEqual(
        TOPICS_TO_FOLLOW_NNS.filter(
          (topic) =>
            topic !== Topic.ManageNeuron && !DEPRECATED_TOPICS.includes(topic)
        )
      );
      expect(topicsToFollow(neuronWithManageNeuron)).toEqual(
        TOPICS_TO_FOLLOW_NNS.filter(
          (topic) => !DEPRECATED_TOPICS.includes(topic)
        )
      );
    });

    it("should return topics with ManageNeuron if neuron follows some neuron on the ManageNeuron topic", () => {
      expect(topicsToFollow(neuronWithManageNeuron)).toEqual(
        TOPICS_TO_FOLLOW_NNS.filter(
          (topic) => !DEPRECATED_TOPICS.includes(topic)
        )
      );
    });
  });

  describe("userAuthorizedNeuron", () => {
    it("should return false if no fullNeuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(userAuthorizedNeuron(neuron)).toBe(false);
    });
    it("should return true if no fullNeuron", () => {
      expect(userAuthorizedNeuron(mockNeuron)).toBe(true);
    });
  });

  describe("votedNeuronDetails", () => {
    it("should return array of CompactNeuronInfo", () => {
      const neuronId1 = 10_000n;
      const neuronId2 = 20_000n;
      const proposalId = 1_111n;
      const ballot1 = {
        neuronId: neuronId1,
        votingPower: 40n,
        vote: Vote.No,
      };
      const ballot2 = {
        neuronId: neuronId2,
        votingPower: 50n,
        vote: Vote.Yes,
      };
      const neuron1 = {
        ...mockNeuron,
        neuronId: neuronId1,
        recentBallots: [{ vote: Vote.No, proposalId }],
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: neuronId2,
        recentBallots: [{ vote: Vote.No, proposalId }],
      };
      const proposal = {
        ...mockProposalInfo,
        id: proposalId,
        ballots: [ballot1, ballot2],
      };
      const expected = votedNeuronDetails({
        neurons: [neuron1, neuron2],
        proposal,
      });
      expect(expected).toHaveLength(2);
      const compactNeuron1 = expected.find(
        ({ idString }) => idString === neuronId1.toString()
      );
      expect(compactNeuron1).toBeDefined();
      compactNeuron1 &&
        expect(compactNeuron1.votingPower).toBe(ballot1.votingPower);
    });

    it("should filters out neurons without vote", () => {
      const neuronId1 = 10_000n;
      const neuronId2 = 20_000n;
      const proposalId = 1_111n;
      const neuron1 = {
        ...mockNeuron,
        neuronId: neuronId1,
        recentBallots: [{ vote: Vote.No, proposalId }],
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: neuronId2,
        recentBallots: [],
      };
      const ballot1 = {
        neuronId: neuronId1,
        votingPower: 40n,
        vote: Vote.No,
      };
      const proposal = {
        ...mockProposalInfo,
        id: proposalId,
        ballots: [ballot1],
      };
      const expected = votedNeuronDetails({
        neurons: [neuron1, neuron2],
        proposal,
      });
      expect(expected).toHaveLength(1);
    });
  });

  describe("votedNeuronDetails", () => {
    it("should return neurons voting power", () => {
      const neurons = [
        {
          idString: "100",
          votingPower: 100n,
          vote: Vote.No,
        },
        {
          idString: "200",
          votingPower: 200n,
          vote: Vote.Yes,
        },
      ] as CompactNeuronInfo[];
      expect(neuronsVotingPower(neurons)).toBe(300n);
    });
  });

  describe("neuronCanBeSplit", () => {
    it("should return true if neuron has enough stake to be splitted", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: 1_000_000_000n,
          neuronFees: 10n,
        },
      };
      expect(neuronCanBeSplit({ neuron, fee: 10_000n })).toBe(true);
    });

    it("should return false if neuron has not enough stake to be splitted", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: 100n,
          neuronFees: 10n,
        },
      };
      expect(neuronCanBeSplit({ neuron, fee: 10_000n })).toBe(false);
    });
  });

  describe("hasEnoughMaturityToStake", () => {
    it("returns false when no full neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(hasEnoughMaturityToStake(neuron)).toBe(false);
    });

    it("returns false if neuron maturity is 0", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: 0n,
        },
      };
      expect(hasEnoughMaturityToStake(neuron)).toBe(false);
    });

    it("returns true if maturity larger than needed", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: 1_000n,
        },
      };
      expect(hasEnoughMaturityToStake(neuron)).toBe(true);
    });

    it("returns false if maturity smaller than needed", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: BigInt(-100),
        },
      };
      expect(hasEnoughMaturityToStake(neuron)).toBe(false);
    });
  });

  describe("minNeuronSplittable", () => {
    it("returns fee plus two ICPs", () => {
      const received = minNeuronSplittable(10_000n);
      expect(received).toBe(10_000n + 200_000_000n);
    });
  });

  describe("getNeuronById", () => {
    afterEach(() => neuronsStore.setNeurons({ neurons: [], certified: true }));
    it("returns neuron when present in store", () => {
      const neuronId = 1_234n;
      const neuron = {
        ...mockNeuron,
        neuronId,
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const store = get(neuronsStore);
      const received = getNeuronById({ neuronsStore: store, neuronId });
      expect(received).toBe(neuron);
    });

    it("returns undefined when not present in store", () => {
      const neuronId = 1_234n;
      const neuron = {
        ...mockNeuron,
        neuronId: 1_235n,
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const store = get(neuronsStore);
      const received = getNeuronById({ neuronsStore: store, neuronId });
      expect(received).toBeUndefined();
    });

    it("returns undefined if no neurons in store", () => {
      const neuronId = 1_234n;
      const store = get(neuronsStore);
      const received = getNeuronById({ neuronsStore: store, neuronId });
      expect(received).toBeUndefined();
    });
  });

  describe("validTopUpAmount", () => {
    it("should return true if neuron has enough stake", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: MIN_NEURON_STAKE * 2n,
        },
      };
      expect(validTopUpAmount({ neuron, amount: 0.001 })).toBe(true);
    });

    it("should return true if amount to top is large enough", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: 10n,
        },
      };
      expect(
        validTopUpAmount({
          neuron,
          amount: 2,
        })
      ).toBe(true);
    });

    it("should return false if amount and stake are not big enough", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: MIN_NEURON_STAKE / 2n - 10n,
        },
      };
      expect(
        validTopUpAmount({
          neuron,
          amount: 0.4,
        })
      ).toBe(false);
    });
  });

  describe("neuronAge", () => {
    it("should return ageSeconds property", () => {
      expect(neuronAge(mockNeuron)).toEqual(mockNeuron.ageSeconds);
    });

    it("should return max age value", () => {
      const neuron = {
        ...mockNeuron,
        ageSeconds: mockNeuron.ageSeconds + BigInt(SECONDS_IN_FOUR_YEARS),
      };
      expect(neuronAge(neuron)).toEqual(BigInt(SECONDS_IN_FOUR_YEARS));
    });
  });

  describe("filterIneligibleNnsNeurons", () => {
    const proposalTimestampSeconds = 100n;
    const testProposalInfo = {
      ...mockProposalInfo,
      proposalTimestampSeconds,
      ballots: [
        {
          neuronId: 3n,
          vote: Vote.Yes,
          votingPower: 12_345n,
        },
      ],
    } as ProposalInfo;
    const testSinceNeuron = {
      ...mockNeuron,
      neuronId: 1n,
      createdTimestampSeconds: proposalTimestampSeconds + 1n,
    } as NeuronInfo;
    const testShortNeuron = {
      ...mockNeuron,
      neuronId: 2n,
      createdTimestampSeconds: proposalTimestampSeconds - 1n,
    } as NeuronInfo;
    const testVotedNeuron = {
      ...mockNeuron,
      neuronId: 3n,
    } as NeuronInfo;

    it("should return ineligible neurons data", () => {
      expect(
        filterIneligibleNnsNeurons({
          proposal: testProposalInfo,
          neurons: [testSinceNeuron, testShortNeuron, testVotedNeuron],
        }).length
      ).toEqual(2);
    });

    it("should return since reason data", () => {
      expect(
        filterIneligibleNnsNeurons({
          proposal: testProposalInfo,
          neurons: [testSinceNeuron],
        })
      ).toEqual([
        {
          neuronIdString: "1",
          reason: "since",
        },
      ] as IneligibleNeuronData[]);
    });

    it("should return short reason data", () => {
      expect(
        filterIneligibleNnsNeurons({
          proposal: testProposalInfo,
          neurons: [testShortNeuron],
        })
      ).toEqual([
        {
          neuronIdString: "2",
          reason: "short",
        },
      ] as IneligibleNeuronData[]);
    });
  });

  describe("maturityLastDistribution", () => {
    it("should return last distribution timestamp w/o rollovers", () => {
      const testRewardEvent = {
        ...mockRewardEvent,
        actual_timestamp_seconds: 12_234_455_555n,
        settled_proposals: [
          {
            id: 0n,
          },
        ],
      } as RewardEvent;
      expect(maturityLastDistribution(testRewardEvent)).toEqual(
        12_234_455_555n
      );
    });

    it("should return last distribution timestamp after 3 rollovers", () => {
      const testRewardEvent = {
        ...mockRewardEvent,
        actual_timestamp_seconds: 12_234_455_555n,
        rounds_since_last_distribution: [3n],
        settled_proposals: [],
      } as RewardEvent;
      const threeDays = BigInt(3 * SECONDS_IN_DAY);
      expect(maturityLastDistribution(testRewardEvent)).toEqual(
        12_234_455_555n - threeDays
      );
    });
  });

  describe("canUserManageNeuronFundParticipation", () => {
    const identityMainAccount = {
      ...mockMainAccount,
      principal: mockIdentity.getPrincipal(),
    };

    it("should return true if user is controller", () => {
      const accounts: IcpAccountsStoreData = {
        main: identityMainAccount,
        subAccounts: [],
        hardwareWallets: [],
      };
      const neuron: NeuronInfo = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: identityMainAccount.principal?.toText(),
          hotKeys: [],
        },
      };
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("should return false if no identity", () => {
      const accounts: IcpAccountsStoreData = {
        main: identityMainAccount,
        subAccounts: [],
        hardwareWallets: [],
      };
      const neuron: NeuronInfo = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: identityMainAccount.principal?.toText(),
          hotKeys: [],
        },
      };
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: undefined,
        })
      ).toBe(false);
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: null,
        })
      ).toBe(false);
    });

    it("should return true if user is hotkey and no hardware wallet is attached", () => {
      const accounts: IcpAccountsStoreData = {
        main: identityMainAccount,
        subAccounts: [],
        hardwareWallets: [],
      };
      const neuron: NeuronInfo = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "not-user",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("should return false if user is hotkey and attached hardware wallet is controller", () => {
      const accounts: IcpAccountsStoreData = {
        main: identityMainAccount,
        subAccounts: [],
        hardwareWallets: [mockHardwareWalletAccount],
      };
      const neuron: NeuronInfo = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockHardwareWalletAccount.principal?.toText(),
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: mockIdentity,
        })
      ).toBe(false);
    });

    it("should return false if user is not a hotkey nor controller", () => {
      const accounts: IcpAccountsStoreData = {
        main: identityMainAccount,
        subAccounts: [],
        hardwareWallets: [],
      };
      const neuron: NeuronInfo = {
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "not-user",
          hotKeys: [],
        },
      };
      expect(
        canUserManageNeuronFundParticipation({
          neuron,
          accounts,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });
});
