import { ICP } from "@dfinity/nns";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_HOUR,
} from "../../../lib/constants/constants";
import { TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import { hasValidStake, votingPower } from "../../../lib/utils/neuron.utils";
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

    it("should return the doulbe when delay is eight years", () => {
      const stake = "2.2";
      const icp = ICP.fromString(stake) as ICP;
      expect(
        votingPower({
          stake: icp.toE8s(),
          dissolveDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
        })
      ).toBe(Number(stake) * 2);
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
});
