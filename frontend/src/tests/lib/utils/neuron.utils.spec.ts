import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_HOUR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import {
  DEFAULT_TRANSACTION_FEE_E8S,
  E8S_PER_ICP,
} from "$lib/constants/icp.constants";
import {
  MAX_NEURONS_MERGED,
  MIN_NEURON_STAKE,
  TOPICS_TO_FOLLOW_NNS,
} from "$lib/constants/neurons.constants";
import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  ageMultiplier,
  allHaveSameFollowees,
  ballotsWithDefinedProposal,
  canBeMerged,
  checkInvalidState,
  dissolveDelayMultiplier,
  followeesByTopic,
  followeesNeurons,
  formatVotingPower,
  formattedMaturity,
  formattedStakedMaturity,
  formattedTotalMaturity,
  getDissolvingTimeInSeconds,
  getNeuronById,
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
  minNeuronSplittable,
  neuronAge,
  neuronCanBeSplit,
  neuronStake,
  neuronVotingPower,
  sortNeuronsByCreatedTimestamp,
  topicsToFollow,
  userAuthorizedNeuron,
  validTopUpAmount,
  votedNeuronDetails,
  type InvalidState,
} from "$lib/utils/neuron.utils";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockFullNeuron,
  mockNeuron,
  mockNeuronControlled,
  mockNeuronNotControlled,
} from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { WizardStep } from "@dfinity/gix-components";
import {
  ICPToken,
  NeuronState,
  TokenAmount,
  Topic,
  Vote,
  type BallotInfo,
} from "@dfinity/nns";
import { get } from "svelte/store";

describe("neuron-utils", () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(Date.now()));

  afterAll(() => jest.useRealTimers());

  describe("votingPower", () => {
    const tokenStake = TokenAmount.fromString({
      amount: "2.2",
      token: ICPToken,
    }) as TokenAmount;
    const neuron = {
      ...mockNeuron,
      ageSeconds: BigInt(0),
      dissolveDelaySeconds: BigInt(0),
      fullNeuron: {
        ...mockFullNeuron,
        cachedNeuronStake: tokenStake.toE8s(),
      },
    };
    it("should return zero for delays less than six months", () => {
      expect(
        neuronVotingPower({
          neuron: mockNeuron,
          newDissolveDelayInSeconds: BigInt(100),
        })
      ).toBe(BigInt(0));
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
      ).toBe(tokenStake.toE8s() * BigInt(2));
    });

    it("should take into account age bonus", () => {
      const agedNeuron = {
        ...neuron,
        ageSeconds: BigInt(SECONDS_IN_YEAR),
        dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };

      const notSoAgedNeuron = {
        ...neuron,
        ageSeconds: BigInt(2),
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
          cachedNeuronStake: BigInt(200_000_000),
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
      expect(formatVotingPower(BigInt(0))).toBe("0.00");
      expect(formatVotingPower(BigInt(100000000))).toBe("1.00");
      expect(formatVotingPower(BigInt(9999900000))).toBe("100.00");
    });
  });

  describe("dissolveDelayMultiplier", () => {
    it("be 1 when dissolve is 0", () => {
      expect(dissolveDelayMultiplier(BigInt(0))).toBe(1);
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
      expect(dissolveDelayMultiplier(BigInt(1000))).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(dissolveDelayMultiplier(BigInt(SECONDS_IN_YEAR))).toBe(1.125);
    });
  });

  describe("ageMultiplier", () => {
    it("be 1 when age is 0", () => {
      expect(ageMultiplier(BigInt(0))).toBe(1);
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
      expect(ageMultiplier(BigInt(1000))).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(ageMultiplier(BigInt(SECONDS_IN_YEAR))).toBe(1.0625);
    });
  });

  describe("hasValidStake", () => {
    it("returns whether the stake is valid or not", () => {
      const fullNeuronWithEnoughStake = {
        ...mockFullNeuron,
        cachedNeuronStake: BigInt(3_000_000_000),
      };
      const neuronWithEnoughStake = {
        ...mockNeuron,
        fullNeuron: fullNeuronWithEnoughStake,
      };
      expect(hasValidStake(neuronWithEnoughStake)).toBeTruthy();

      const fullNeuronWithEnoughStakeInMaturity = {
        ...mockFullNeuron,
        cachedNeuronStake: BigInt(100_000_000),
        maturityE8sEquivalent: BigInt(3_000_000_000),
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
      expect(hasValidStake(neuronWithoutEnoughStake)).toBeFalsy();

      const neuronWithoutFullNeuron = {
        ...mockNeuron,
      };
      neuronWithoutFullNeuron.fullNeuron = undefined;
      expect(hasValidStake(neuronWithoutFullNeuron)).toBeFalsy();
    });
  });

  describe("hasJoinedCommunityFund", () => {
    it("returns true when neuron has joined community", () => {
      const joinedNeuron = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: BigInt(100),
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
          maturityE8sEquivalent: stake.toE8s() / BigInt(2),
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
          maturityE8sEquivalent: BigInt(0),
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
          stakedMaturityE8sEquivalent: stake.toE8s() / BigInt(2),
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
          stakedMaturityE8sEquivalent: BigInt(0),
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
          maturityE8sEquivalent: BigInt(0),
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
          stakedMaturityE8sEquivalent: stake.toE8s() / BigInt(2),
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
          stakedMaturityE8sEquivalent: BigInt(0),
        },
      };
      expect(formattedStakedMaturity(neuron)).toBe("0");
    });
  });

  describe("sortNeuronsByCreatedTimestamp", () => {
    it("should sort neurons by createdTimestampSeconds", () => {
      const neuron1 = { ...mockNeuron, createdTimestampSeconds: BigInt(1) };
      const neuron2 = { ...mockNeuron, createdTimestampSeconds: BigInt(2) };
      const neuron3 = { ...mockNeuron, createdTimestampSeconds: BigInt(3) };
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
          cachedNeuronStake: BigInt(100),
          neuronFees: BigInt(10),
        },
      };
      expect(neuronStake(neuron)).toBe(BigInt(90));
    });

    it("should return 0n when stake is not available", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(neuronStake(neuron)).toBe(BigInt(0));
    });
  });

  describe("ballotsWithDefinedProposal", () => {
    const ballot: BallotInfo = {
      vote: Vote.Yes,
      proposalId: undefined,
    };
    const ballotWithProposalId: BallotInfo = {
      vote: Vote.Yes,
      proposalId: BigInt(0),
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
              followees: [BigInt(0), BigInt(1)],
            },
            {
              topic: Topic.Kyc,
              followees: [BigInt(1)],
            },
            {
              topic: Topic.Governance,
              followees: [BigInt(0), BigInt(1), BigInt(2)],
            },
          ],
        },
      };

      expect(followeesNeurons(neuron)).toStrictEqual([
        {
          neuronId: BigInt(0),
          topics: [Topic.ExchangeRate, Topic.Governance],
        },
        {
          neuronId: BigInt(1),
          topics: [Topic.ExchangeRate, Topic.Kyc, Topic.Governance],
        },
        {
          neuronId: BigInt(2),
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
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE + 1_000),
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(false);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE * 2 + 1_000),
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
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE * 3 + 1_000),
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(true);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE * 5 + 1_000),
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
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE - 1_000),
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron, percentage: 100 })).toBe(false);

      const neuron2 = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: BigInt(MIN_NEURON_STAKE * 2 + 1_000),
        },
      };
      expect(isEnoughMaturityToSpawn({ neuron: neuron2, percentage: 10 })).toBe(
        false
      );
    });
  });

  describe("isEnoughToStakeNeuron", () => {
    it("return true if enough ICP to create a neuron", () => {
      expect(isEnoughToStakeNeuron({ stakeE8s: BigInt(300_000_000) })).toBe(
        true
      );
    });
    it("returns false if not enough ICP to create a neuron", () => {
      expect(isEnoughToStakeNeuron({ stakeE8s: BigInt(10_000) })).toBe(false);
    });

    it("takes into account fee", () => {
      expect(
        isEnoughToStakeNeuron({
          stakeE8s: BigInt(100_000_000),
          feeE8s: BigInt(10_000),
        })
      ).toBe(false);
      expect(
        isEnoughToStakeNeuron({
          stakeE8s: BigInt(100_000_000),
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
      jest.clearAllMocks();
    });

    const stepName = "ok";
    const spyOnInvalid = jest.fn();
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
      const followees = [BigInt(4), BigInt(6), BigInt(9)];
      expect(allHaveSameFollowees([followees, [...followees]])).toBe(true);
    });

    it("returns true if no followees", () => {
      expect(allHaveSameFollowees([[], [], []])).toBe(true);
    });

    it("returns false if not same followees", () => {
      const followees1 = [BigInt(4), BigInt(6), BigInt(9)];
      const followees2 = [BigInt(1), BigInt(6), BigInt(9)];
      expect(allHaveSameFollowees([followees1, followees2])).toBe(false);
    });

    it("returns false if not the same amount", () => {
      const followees = [BigInt(4), BigInt(6), BigInt(9)];
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
          spawnAtTimesSeconds: BigInt(123123113),
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
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuron2 = {
        ...neuron,
        neuronId: BigInt(444),
      };
      const neuron3 = {
        ...neuron,
        neuronId: BigInt(445),
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
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: "not-user",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(444),
        joinedCommunityFundTimestampSeconds: BigInt(1234),
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
        neuronId: BigInt(444),
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [BigInt(444)] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: BigInt(445),
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
        neuronId: BigInt(444),
        fullNeuron: {
          ...neuron.fullNeuron,
          controller: mainAccountController,
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: BigInt(445),
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
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuronFollowingManageNeuron = {
        ...neuron,
        neuronId: BigInt(444),
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [BigInt(444)] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: BigInt(445),
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
        fullNeuron: {
          ...mockFullNeuron,
          hasJoinedCommunityFund: undefined,
          controller: mainAccountController,
          hotKeys: [],
        },
      };
      const neuronFollowingManageNeuron = {
        ...neuron,
        neuronId: BigInt(444),
        fullNeuron: {
          ...neuron.fullNeuron,
          followees: [{ topic: Topic.ManageNeuron, followees: [BigInt(444)] }],
        },
      };
      const neuron3 = {
        ...neuron,
        neuronId: BigInt(445),
      };
      const neuron4 = {
        ...neuron,
        neuronId: BigInt(455),
      };
      const neuron5 = {
        ...neuron,
        neuronId: BigInt(465),
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
        neuronId: BigInt(444),
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
        neuronId: BigInt(444),
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
              followees: [BigInt(10), BigInt(40)],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(444),
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [BigInt(10)],
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
              followees: [BigInt(40), BigInt(10)],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(444),
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [BigInt(10), BigInt(40)],
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
              followees: [BigInt(40), BigInt(10)],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(444),
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
              followees: [BigInt(40), BigInt(10)],
            },
          ],
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(444),
        fullNeuron: {
          ...mockFullNeuron,
          controller: "controller",
          followees: [
            {
              topic: Topic.ManageNeuron,
              followees: [BigInt(40), BigInt(200)],
            },
          ],
        },
      };
      expect(canBeMerged([neuron, neuron2]).isValid).toBe(false);
    });
  });

  describe("followeesByTopic", () => {
    const followees = [
      {
        topic: Topic.ExchangeRate,
        followees: [BigInt(0), BigInt(1)],
      },
      {
        topic: Topic.Kyc,
        followees: [BigInt(1)],
      },
      {
        topic: Topic.Governance,
        followees: [BigInt(0), BigInt(1), BigInt(2)],
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
            followees: [BigInt(0), BigInt(1)],
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
            followees: [BigInt(0), BigInt(1)],
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
      const neuronId1 = BigInt(10_000);
      const neuronId2 = BigInt(20_000);
      const proposalId = BigInt(1111);
      const ballot1 = {
        neuronId: neuronId1,
        votingPower: BigInt(40),
        vote: Vote.No,
      };
      const ballot2 = {
        neuronId: neuronId2,
        votingPower: BigInt(50),
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
      const compactNeuron1 = expected.find(({ id }) => id === neuronId1);
      expect(compactNeuron1).toBeDefined();
      compactNeuron1 &&
        expect(compactNeuron1.votingPower).toBe(ballot1.votingPower);
    });

    it("should filters out neurons without vote", () => {
      const neuronId1 = BigInt(10_000);
      const neuronId2 = BigInt(20_000);
      const proposalId = BigInt(1111);
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
        votingPower: BigInt(40),
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

  describe("neuronCanBeSplit", () => {
    it("should return true if neuron has enough stake to be splitted", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(1_000_000_000),
          neuronFees: BigInt(10),
        },
      };
      expect(neuronCanBeSplit({ neuron, fee: 10_000 })).toBe(true);
    });

    it("should return false if neuron has not enough stake to be splitted", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(100),
          neuronFees: BigInt(10),
        },
      };
      expect(neuronCanBeSplit({ neuron, fee: 10_000 })).toBe(false);
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
          maturityE8sEquivalent: BigInt(0),
        },
      };
      expect(hasEnoughMaturityToStake(neuron)).toBe(false);
    });

    it("returns true if maturity larger than needed", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          maturityE8sEquivalent: BigInt(1000),
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
      const received = minNeuronSplittable(10_000);
      expect(received).toBe(10_000 + 2 * E8S_PER_ICP);
    });
  });

  describe("getNeuronById", () => {
    afterEach(() => neuronsStore.setNeurons({ neurons: [], certified: true }));
    it("returns neuron when present in store", () => {
      const neuronId = BigInt(1234);
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
      const neuronId = BigInt(1234);
      const neuron = {
        ...mockNeuron,
        neuronId: BigInt(1235),
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const store = get(neuronsStore);
      const received = getNeuronById({ neuronsStore: store, neuronId });
      expect(received).toBeUndefined();
    });

    it("returns undefined if no neurons in store", () => {
      const neuronId = BigInt(1234);
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
          cachedNeuronStake: BigInt(MIN_NEURON_STAKE * 2),
        },
      };
      expect(validTopUpAmount({ neuron, amount: 0.001 })).toBe(true);
    });

    it("should return true if amount to top is large enough", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(10),
        },
      };
      expect(
        validTopUpAmount({
          neuron,
          amount: (MIN_NEURON_STAKE * 2) / E8S_PER_ICP,
        })
      ).toBe(true);
    });

    it("should return false if amount and stake are not big enough", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(MIN_NEURON_STAKE / 2 - 10),
        },
      };
      expect(
        validTopUpAmount({
          neuron,
          amount: MIN_NEURON_STAKE / 2 / E8S_PER_ICP - 10,
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
});
