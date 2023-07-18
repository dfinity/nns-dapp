/**
 * @jest-environment jsdom
 */

import NnsNeuronAdvancedSection from "$lib/components/neuron-detail/NnsNeuronAdvancedSection.svelte";
import { SECONDS_IN_MONTH } from "$lib/constants/constants";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import { mockSubAccount } from "$tests/mocks/accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { NnsNeuronAdvancedSectionPo } from "$tests/page-objects/NnsNeuronAdvancedSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "./NeuronContextActionsTest.svelte";

describe("NnsNeuronAdvancedSection", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsNeuronAdvancedSection,
      },
    });

    return NnsNeuronAdvancedSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    nnsLatestRewardEventStore.reset();
  });

  it("should render neuron data", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      neuronId: 12345n,
      createdTimestampSeconds: 1689666271n,
      ageSeconds: BigInt(SECONDS_IN_MONTH),
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        agingSinceTimestampSeconds: BigInt(SECONDS_IN_MONTH),
        accountIdentifier: mockSubAccount.identifier,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.neuronId()).toBe("12345");
    expect(await po.neuronCreated()).toBe("Jul 18, 2023 7:44 AM");
    expect(await po.neuronAge()).toBe("30 days, 10 hours");
    expect(await po.neuronAccount()).toBe("d0654c5...2ff9f32");
  });

  it("should render last rewards distribution", async () => {
    const rewardEvent = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(
        new Date("1992-05-22T21:00:00").getTime() / 1000
      ),
      rounds_since_last_distribution: [3n] as [bigint],
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent,
      certified: true,
    });

    const po = renderComponent(mockNeuron);

    expect(await po.lastRewardsDistribution()).toBe("May 19, 1992");
  });
});
