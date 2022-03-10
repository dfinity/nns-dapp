import { ICP } from "@dfinity/nns";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_HOUR,
} from "../../../lib/constants/constants";
import { votingPower } from "../../../lib/utils/neuron.utils";

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
});
