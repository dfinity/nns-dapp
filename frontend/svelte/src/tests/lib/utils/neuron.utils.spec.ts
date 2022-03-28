import { ICP } from "@dfinity/nns";
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
  hasJoinedCommunityFund,
  hasValidStake,
  votingPower,
} from "../../../lib/utils/neuron.utils";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

describe("neuron-utils", () => {
  describe("votingPower", () => {
    it("should return zero for delays less than six months", () => {
      expect(
        votingPower({ stake: BigInt(2), dissolveDelayInSeconds: 100 })
      ).toBe(0);
    });

    it("should return more than stake when delay more than six months", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      expect(
        votingPower({
          stake: icp.toE8s(),
          dissolveDelayInSeconds: SECONDS_IN_HALF_YEAR + SECONDS_IN_HOUR,
        })
      ).toBeGreaterThan(Number(stake));
    });

    it("should return the double when delay is eight years", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      expect(
        votingPower({
          stake: icp.toE8s(),
          dissolveDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
        })
      ).toBe(Number(stake) * 2);
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
});
