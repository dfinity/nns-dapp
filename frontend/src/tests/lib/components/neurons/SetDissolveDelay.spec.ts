/**
 * @jest-environment jsdom
 */
import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "$lib/constants/constants";
import { SetDissolveDelayPo } from "$tests/page-objects/SetDissolveDelay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SetDissolveDelay", () => {
  describe("current dissolve delay is Max - (less than a day in seconds)", () => {
    it("should enable button if user clicks Max button", async () => {
      const neuronDissolveDelaySeconds = SECONDS_IN_EIGHT_YEARS - 10;
      const { container } = render(SetDissolveDelay, {
        props: {
          neuronState: NeuronState.Locked,
          neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
          neuronStake: TokenAmount.fromE8s({
            amount: BigInt(200_000_000),
            token: ICPToken,
          }),
          delayInSeconds: neuronDissolveDelaySeconds,
          minDelayInSeconds: neuronDissolveDelaySeconds,
          minProjectDelayInSeconds: SECONDS_IN_HALF_YEAR,
          maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
          calculateVotingPower: () => 0,
          minDissolveDelayDescription: "",
        },
      });
      const po = SetDissolveDelayPo.under(new JestPageObjectElement(container));
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);

      await po.clickMax();
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
    });
  });
});
