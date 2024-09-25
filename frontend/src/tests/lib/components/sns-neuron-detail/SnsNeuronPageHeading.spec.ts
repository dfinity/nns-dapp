import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
} from "$lib/constants/constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { authStore } from "$lib/stores/auth.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronPageHeadingPo } from "$tests/page-objects/SnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronPageHeading", () => {
  const minDissolveDelayToVote = BigInt(30 * SECONDS_IN_DAY);
  const maxDissolveDelay = BigInt(SECONDS_IN_EIGHT_YEARS);
  const maxDissolveDelayBonusMultiplier = 2;
  const maxDissolveDelayBonusPercentage =
    100 * (maxDissolveDelayBonusMultiplier - 1);
  const maxAgeForBonus = BigInt(SECONDS_IN_FOUR_YEARS);
  const maxAgeBonusMultiplier = 1.25;
  const maxAgeBonusPercentage = 100 * (maxAgeBonusMultiplier - 1);

  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronPageHeading, {
      props: {
        neuron,
        parameters: {
          ...snsNervousSystemParametersMock,
          max_dissolve_delay_seconds: [maxDissolveDelay],
          max_dissolve_delay_bonus_percentage: [
            BigInt(maxDissolveDelayBonusPercentage),
          ],
          neuron_minimum_stake_e8s: [100_000_000n],
          max_neuron_age_for_age_bonus: [maxAgeForBonus],
          neuron_minimum_dissolve_delay_to_vote_seconds: [
            minDissolveDelayToVote,
          ],
          max_age_bonus_percentage: [BigInt(maxAgeBonusPercentage)],
        },
      },
    });

    return SnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    // Make sure that nowInSeconds() returns a fixed value for the calculation
    // of the neuron age.
    vi.useFakeTimers();
  });

  it("should render the neuron's stake", async () => {
    const stake = 314_560_000n;
    const po = renderSnsNeuronCmp({
      ...mockSnsNeuron,
      cached_neuron_stake_e8s: stake,
    });

    expect(await po.getStake()).toEqual("3.1456");
  });

  it("should render the neuron's voting power", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      stake: 200_000_000n,
      stakedMaturity: 100_000_000n,
      dissolveDelaySeconds: maxDissolveDelay,
      ageSinceTimestampSeconds: BigInt(nowInSeconds()) - 2n * maxAgeForBonus,
    });
    const po = renderSnsNeuronCmp(neuron);

    // Expected voting power is:
    // (stake + staked maturity)
    //   * max dissolve delay multiplier
    //   * max age bonus multiplier
    // = (2.00 + 1.00) * 2.00 * 1.25
    // = 7.50
    expect(await po.getVotingPower()).toEqual("Voting Power: 7.50");
  });

  it("should render no votig power if neuron can't vote", async () => {
    const stake = 314_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      dissolveDelaySeconds: minDissolveDelayToVote - 100n,
      stake,
    });
    const po = renderSnsNeuronCmp(neuron);

    expect(await po.getVotingPower()).toEqual("No Voting Power");
  });

  it("should render hotkey tag if user is a hotkey", async () => {
    const hotkeyPermissions = {
      principal: [mockIdentity.getPrincipal()] as [Principal],
      permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
    };
    const neuron = createMockSnsNeuron({
      id: [1],
      permissions: [hotkeyPermissions],
    });
    const po = renderSnsNeuronCmp(neuron);

    expect(await po.hasHotkeyTag()).toBe(true);
  });
});
