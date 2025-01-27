import NnsLosingRewardsNeuronCard from "$lib/components/neurons/NnsLosingRewardsNeuronCard.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsLosingRewardsNeuronCardPo } from "$tests/page-objects/NnsLosingRewardsNeuronCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsLosingRewardsNeuronCard", () => {
  const followNeuronId1 = 111n;
  const followNeuronId2 = 222n;
  const neuronId = 123n;
  const neuron: NeuronInfo = {
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: [followNeuronId1, followNeuronId2],
        },
        {
          topic: Topic.Governance,
          followees: [followNeuronId1],
        },
      ],
      votingPowerRefreshedTimestampSeconds: BigInt(
        nowInSeconds() - SECONDS_IN_YEAR
      ),
    },
  };

  const renderComponent = ({
    neuron,
    onClick,
  }: {
    neuron: NeuronInfo;
    onClick?: () => void;
  }) => {
    const { container } = render(NnsLosingRewardsNeuronCard, {
      props: {
        neuron,
        onClick,
      },
    });

    return NnsLosingRewardsNeuronCardPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should dispatch nnsClick", async () => {
    const onClick = vi.fn();
    const po = await renderComponent({ neuron, onClick });

    expect(onClick).not.toHaveBeenCalled();

    await po.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render 'Missing rewards' tag", async () => {
    overrideFeatureFlagsStore.setFlag(
      "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
      true
    );
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    const po = await renderComponent({ neuron });
    expect(await po.getNeuronTags()).toEqual(["Missing rewards"]);
  });

  it("should render following", async () => {
    const po = await renderComponent({ neuron });

    const followeePos = await po.getFolloweePos();

    expect(await po.hasNoFollowingMessage()).toEqual(false);

    expect(followeePos.length).toBe(2);
    expect(await followeePos[0].getName()).toEqual(`${followNeuronId1}`);
    expect(await followeePos[0].getTags()).toEqual([
      "Exchange Rate",
      "Governance",
    ]);
    expect(await followeePos[1].getName()).toEqual(`${followNeuronId2}`);
    expect(await followeePos[1].getTags()).toEqual(["Exchange Rate"]);
  });

  it("should display no following message", async () => {
    const po = await renderComponent({
      neuron: {
        ...neuron,
        fullNeuron: {
          ...neuron.fullNeuron,
          // no followees
          followees: [],
        },
      },
    });

    expect((await po.getFolloweePos()).length).toBe(0);
    expect(await po.hasNoFollowingMessage()).toEqual(true);
  });
});
