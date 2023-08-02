/**
 * @jest-environment jsdom
 */

import NnsNeuronPageHeading from "$lib/components/neuron-detail/NnsNeuronPageHeading.svelte";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeadingPo } from "$tests/page-objects/NnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPageHeading", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeading, { props: { neuron } });

    return NnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render the neuron's stake", async () => {
    const stake = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees: 0n,
      },
    });

    expect(await po.getStake()).toEqual("3.14");
  });

  it("should render neuron's voting power", async () => {
    const votingPower = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      votingPower,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE * 2),
    });

    expect(await po.getVotingPower()).toEqual("Voting Power: 3.14");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const votingPower = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      votingPower,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 100),
    });

    expect(await po.getVotingPower()).toEqual("No Voting Power");
  });

  it("should render neuron's fund tag if belongs part of neurons fund", async () => {
    const po = renderComponent({
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: BigInt(12333444),
    });

    expect(await po.hasNeuronsFundTag()).toBe(true);
  });

  it("should hotkey tag is user is a hotkey", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-current-principal",
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(await po.hasHotkeyTag()).toBe(true);
  });
});
