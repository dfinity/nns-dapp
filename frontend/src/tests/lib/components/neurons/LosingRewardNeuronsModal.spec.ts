import { clearCache } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { SECONDS_IN_DAY, SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import LosingRewardNeuronsModal from "$lib/modals/neurons/LosingRewardNeuronsModal.svelte";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { LosingRewardNeuronsModalPo } from "$tests/page-objects/LosingRewardNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

describe("LosingRewardNeuronsModal", () => {
  const nowSeconds = nowInSeconds();
  const activeNeuron = {
    ...mockNeuron,
    neuronId: 0n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const in10DaysLosingRewardsNeuron = {
    ...mockNeuron,
    neuronId: 1n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR + 10 * SECONDS_IN_DAY
      ),
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const losingRewardsNeuron = {
    ...mockNeuron,
    neuronId: 2n,
    fullNeuron: {
      ...mockFullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowSeconds - SECONDS_IN_HALF_YEAR
      ),
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const neurons = [
    activeNeuron,
    in10DaysLosingRewardsNeuron,
    losingRewardsNeuron,
  ];
  const refreshedNeurons = neurons.map((neuron) => ({
    ...neuron,
    fullNeuron: {
      ...neuron.fullNeuron,
      votingPowerRefreshedTimestampSeconds: BigInt(nowSeconds),
    },
  }));
  let spyRefreshVotingPower;

  const renderComponent = ({
    neurons,
    withNeuronNavigation,
    onClose,
  }: {
    neurons?: NeuronInfo[];
    withNeuronNavigation?: boolean;
    onClose?: () => void;
  } = {}) => {
    const { container } = render(LosingRewardNeuronsModal, {
      props: {
        neurons,
        withNeuronNavigation,
      },
      events: {
        ...(nonNullish(onClose) && { nnsClose: onClose }),
      },
    });

    return LosingRewardNeuronsModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    resetIdentity();
    // Remove known neurons from the cache.
    clearCache();

    vi.useFakeTimers({
      now: nowSeconds * 1000,
    });

    page.mock({
      routeId: AppPath.Staking,
      data: { universe: OWN_CANISTER_ID_TEXT },
    });

    vi.spyOn(governanceApi, "queryKnownNeurons").mockResolvedValue([]);
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue(refreshedNeurons);
    spyRefreshVotingPower = vi
      .spyOn(governanceApi, "refreshVotingPower")
      .mockResolvedValue();
  });

  it("should dispatch on close", async () => {
    const onClose = vi.fn();
    const po = await renderComponent({
      onClose,
      neurons,
    });

    expect(onClose).toHaveBeenCalledTimes(0);
    await po.clickCancel();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should display description", async () => {
    const po = await renderComponent({ neurons });
    expect(await po.getDescriptionPo().isPresent()).toEqual(false);
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });
    await runResolvedPromises();
    expect(await po.getDescriptionPo().isPresent()).toEqual(true);
    expect(await po.getDescriptionPo().getText()).toEqual(
      "ICP neurons that are inactive for 6 months start missing voting rewards. To avoid missing rewards, vote manually, edit, or confirm your following."
    );
  });

  it("should confirm following", async () => {
    const neurons = [in10DaysLosingRewardsNeuron, losingRewardsNeuron];
    neuronsStore.setNeurons({
      neurons,
      certified: true,
    });
    const po = await renderComponent({
      neurons,
    });

    expect((await po.getNnsLosingRewardsNeuronCardPos()).length).toEqual(2);

    await po.clickConfirmFollowing();
    await runResolvedPromises();

    expect(spyRefreshVotingPower).toHaveBeenCalledTimes(2);
    expect(spyRefreshVotingPower).toHaveBeenCalledWith({
      identity: mockIdentity,
      neuronId: in10DaysLosingRewardsNeuron.neuronId,
    });
    expect(spyRefreshVotingPower).toHaveBeenCalledWith({
      identity: mockIdentity,
      neuronId: losingRewardsNeuron.neuronId,
    });
  });

  it("should navigate to the neuron details", async () => {
    const onClose = vi.fn();
    const po = await renderComponent({
      onClose,
      neurons: [losingRewardsNeuron],
    });
    const firstCards = (await po.getNnsLosingRewardsNeuronCardPos())[0];
    expect(onClose).toHaveBeenCalledTimes(0);
    expect(get(pageStore).path).toEqual("/staking");
    expect(get(page).data).toEqual({ universe: OWN_CANISTER_ID_TEXT });
    expect(firstCards).not.toEqual(undefined);
    expect(await firstCards.getNeuronId()).toEqual(
      losingRewardsNeuron.neuronId.toString()
    );

    await firstCards.click();
    await runResolvedPromises();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(get(pageStore).path).toEqual("/neuron");
    expect(get(page).data).toEqual({
      universe: OWN_CANISTER_ID_TEXT,
      neuron: losingRewardsNeuron.neuronId.toString(),
    });
  });

  it("should not navigate to the neuron details when withNeuronNavigation=false", async () => {
    const onClose = vi.fn();
    const po = await renderComponent({
      onClose,
      neurons: [losingRewardsNeuron],
      withNeuronNavigation: false,
    });
    const firstCards = (await po.getNnsLosingRewardsNeuronCardPos())[0];
    expect(get(pageStore).path).toEqual("/staking");
    expect(firstCards).not.toEqual(undefined);

    await firstCards.click();
    await runResolvedPromises();

    expect(onClose).toHaveBeenCalledTimes(0);
    expect(get(pageStore).path).toEqual("/staking");
  });

  it("should fetch known neurons", async () => {
    const queryKnownNeuronsSpy = vi
      .spyOn(governanceApi, "queryKnownNeurons")
      .mockResolvedValue([]);

    expect(queryKnownNeuronsSpy).toHaveBeenCalledTimes(0);
    await renderComponent({
      neurons,
    });
    await runResolvedPromises();
    expect(queryKnownNeuronsSpy).toHaveBeenCalledTimes(2);
    expect(queryKnownNeuronsSpy).toHaveBeenCalledWith({
      certified: true,
      identity: mockIdentity,
    });
    expect(queryKnownNeuronsSpy).toHaveBeenCalledWith({
      certified: false,
      identity: mockIdentity,
    });
  });
});
