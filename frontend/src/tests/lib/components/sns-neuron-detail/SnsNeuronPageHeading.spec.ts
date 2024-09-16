import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
import { SECONDS_IN_EIGHT_YEARS } from "$lib/constants/constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { authStore } from "$lib/stores/auth.store";
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
  const minDissolveDelayToVote = 2_629_800n;

  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronPageHeading, {
      props: {
        neuron,
        parameters: {
          ...snsNervousSystemParametersMock,
          max_dissolve_delay_seconds: [3_155_760_000n],
          max_dissolve_delay_bonus_percentage: [100n],
          neuron_minimum_stake_e8s: [100_000_000n],
          max_neuron_age_for_age_bonus: [15_778_800n],
          neuron_minimum_dissolve_delay_to_vote_seconds: [
            minDissolveDelayToVote,
          ],
          max_age_bonus_percentage: [25n],
        },
      },
    });

    return SnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
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
    const stake = 314_000_000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      stakedMaturity: 100_000_000n,
      stake,
    });
    const po = renderSnsNeuronCmp(neuron);

    expect(await po.getVotingPower()).toEqual("Voting Power: 5.59");
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
