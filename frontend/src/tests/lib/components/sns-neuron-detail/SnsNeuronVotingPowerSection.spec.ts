/**
 * @jest-environment jsdom
 */

import SnsNeuronVotingPowerSection from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerSection.svelte";
import { SECONDS_IN_YEAR } from "$lib/constants/constants";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronVotingPowerSectionPo } from "$tests/page-objects/SnsNeuronVotingPowerSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("NnsStakeItemAction", () => {
  const nowInSeconds = 1689843195;
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronVotingPowerSection, {
      props: {
        neuron,
        parameters: snsNervousSystemParametersMock,
        token: mockToken,
      },
    });

    return SnsNeuronVotingPowerSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(nowInSeconds * 1000);
  });

  it("should render voting power", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      stake: 314000000n,
      stakedMaturity: 100000000n,
      state: NeuronState.Locked,
      dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      ageSinceSeconds: BigInt(nowInSeconds - SECONDS_IN_YEAR),
    });
    const po = renderComponent(neuron);

    expect(await po.getVotingPower()).toBe("5.23");
  });

  it("should render item actions", async () => {
    const po = renderComponent(mockSnsNeuron);

    expect(await po.hasStakeItemAction()).toBe(true);
    expect(await po.hasStateItemAction()).toBe(true);
    expect(await po.hasDisslveDelayItemActionPo()).toBe(true);
  });
});
