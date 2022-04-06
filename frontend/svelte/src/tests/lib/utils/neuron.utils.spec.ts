import { ICP, NeuronState } from "@dfinity/nns";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_HOUR,
  SECONDS_IN_YEAR,
} from "../../../lib/constants/constants";
import { TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import {
  ageMultiplier,
  dissolveDelayMultiplier,
  formatVotingPower,
  getDissolvingTimeInSeconds,
  hasJoinedCommunityFund,
  hasValidStake,
  isCurrentUserController,
  isNeuronControllable,
  maturityByStake,
  neuronStake,
  sortNeuronsByCreatedTimestamp,
  votingPower,
} from "../../../lib/utils/neuron.utils";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

describe("neuron-utils", () => {
  describe("votingPower", () => {
    it("should return zero for delays less than six months", () => {
      expect(
        votingPower({ stake: BigInt(2), dissolveDelayInSeconds: 100 })
      ).toBe(BigInt(0));
    });

    it("should return more than stake when delay more than six months", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      expect(
        votingPower({
          stake: icp.toE8s(),
          dissolveDelayInSeconds: SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR,
        })
      ).toBeGreaterThan(icp.toE8s());
    });

    it("should return the double when delay is eight years", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      expect(
        votingPower({
          stake: icp.toE8s(),
          dissolveDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
        })
      ).toBe(icp.toE8s() * BigInt(2));
    });

    it("should add age multiplier", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      const powerWithAge = votingPower({
        stake: icp.toE8s(),
        dissolveDelayInSeconds: SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR,
        ageSeconds: SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR,
      });
      const powerWithoutAge = votingPower({
        stake: icp.toE8s(),
        dissolveDelayInSeconds: SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR,
      });
      expect(powerWithAge).toBeGreaterThan(powerWithoutAge);
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
      expect(dissolveDelayMultiplier(0)).toBe(1);
    });

    it("be 2 when dissolve is eight years", () => {
      expect(dissolveDelayMultiplier(SECONDS_IN_EIGHT_YEARS)).toBe(2);
    });

    it("is a maximum of 2", () => {
      expect(dissolveDelayMultiplier(SECONDS_IN_EIGHT_YEARS * 2)).toBe(2);
      expect(dissolveDelayMultiplier(SECONDS_IN_EIGHT_YEARS * 4)).toBe(2);
    });

    it("returns more than 1 with positive delay", () => {
      expect(dissolveDelayMultiplier(SECONDS_IN_HALF_YEAR)).toBeGreaterThan(1);
      expect(dissolveDelayMultiplier(1000)).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(dissolveDelayMultiplier(SECONDS_IN_YEAR)).toBe(1.125);
    });
  });

  describe("ageMultiplier", () => {
    it("be 1 when age is 0", () => {
      expect(ageMultiplier(0)).toBe(1);
    });

    it("be 1.25 when age is four years", () => {
      expect(ageMultiplier(SECONDS_IN_FOUR_YEARS)).toBe(1.25);
    });

    it("is a maximum of 1.25", () => {
      expect(ageMultiplier(SECONDS_IN_EIGHT_YEARS * 2)).toBe(1.25);
      expect(ageMultiplier(SECONDS_IN_EIGHT_YEARS * 4)).toBe(1.25);
    });

    it("returns more than 1 with positive age", () => {
      expect(ageMultiplier(SECONDS_IN_HALF_YEAR)).toBeGreaterThan(1);
      expect(ageMultiplier(1000)).toBeGreaterThan(1);
    });

    it("returns expected multiplier for one year", () => {
      expect(ageMultiplier(SECONDS_IN_YEAR)).toBe(1.0625);
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
        cachedNeuronStake: BigInt(TRANSACTION_FEE_E8S / 4),
        maturityE8sEquivalent: BigInt(TRANSACTION_FEE_E8S / 4),
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
        state: NeuronState.DISSOLVED,
      };
      expect(getDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns undefined if dissolve state has no timestamp", () => {
      const neuron = {
        ...mockNeuron,
        state: NeuronState.DISSOLVING,
        fullNeuron: {
          ...mockFullNeuron,
          dissolveState: undefined,
        },
      };
      expect(getDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns duration from today until dissolving time", () => {
      const todayInSeconds = BigInt(Math.round(Date.now() / 1000));
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron = {
        ...mockNeuron,
        state: NeuronState.DISSOLVING,
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

  describe("isCurrentUserController", () => {
    it("returns false when controller not defined", () => {
      const notControlledNeuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: undefined,
        },
      };
      expect(
        isCurrentUserController({
          neuron: notControlledNeuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });

    it("returns true when neuron is controlled by user", () => {
      const userControlledNeuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      expect(
        isCurrentUserController({
          neuron: userControlledNeuron,
          identity: mockIdentity,
        })
      ).toBe(true);
    });

    it("returns false when controller does not match main", () => {
      const userControlledNeuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "bbbbb-bb",
        },
      };
      expect(
        isCurrentUserController({
          neuron: userControlledNeuron,
          identity: mockIdentity,
        })
      ).toBe(false);
    });
  });

  describe("maturityByStake", () => {
    it("returns 0 when no full neuron", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      expect(maturityByStake(neuron)).toBe(0);
    });

    it("returns 0 if neuron stake is 0", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(0),
        },
      };
      expect(maturityByStake(neuron)).toBe(0);
    });

    it("returns maturity in percentage of stake", () => {
      const stake = ICP.fromString("2") as ICP;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          maturityE8sEquivalent: stake.toE8s() / BigInt(2),
        },
      };
      expect(maturityByStake(neuron)).toBe(0.5);
    });

    it("returns maturity up to 6 decimal places", () => {
      const stake = ICP.fromString("3") as ICP;
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: stake.toE8s(),
          maturityE8sEquivalent: stake.toE8s() / BigInt(3),
        },
      };
      expect(maturityByStake(neuron)).toBe(0.333333);
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

    it("should return false if neuron controller is not current main account nor identity", () => {
      const accounts = {
        main: mockMainAccount,
        subaccounts: undefined,
      };

      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "bbbbb-b",
        },
      };

      expect(
        isNeuronControllable({ neuron, identity: mockIdentity, accounts })
      ).toBe(false);
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
});
